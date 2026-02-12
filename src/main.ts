import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security headers
  app.use(helmet.default({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl.split(',').map(url => url.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  });

  // Serve static frontend files in production (when frontend is built)
  const isProduction = process.env.NODE_ENV === 'production';
  const serveStaticFrontend = configService.get<string>('SERVE_STATIC_FRONTEND') !== 'false';
  
  if (isProduction && serveStaticFrontend) {
    try {
      // Try multiple possible paths for frontend dist
      const possiblePaths = [
        join(__dirname, '../../frontend/dist'),
        join(__dirname, '../../../frontend/dist'),
        join(process.cwd(), 'frontend/dist'),
        join(process.cwd(), '../frontend/dist'),
      ];
      
      let frontendDistPath: string | null = null;
      const fs = require('fs');
      
      for (const path of possiblePaths) {
        try {
          if (fs.existsSync(path) && fs.existsSync(join(path, 'index.html'))) {
            frontendDistPath = path;
            break;
          }
        } catch {
          // Continue to next path
        }
      }
      
      if (frontendDistPath) {
        app.useStaticAssets(frontendDistPath, {
          index: false,
          prefix: '/',
        });
        
        // Serve index.html for all non-API routes
        app.use((req, res, next) => {
          if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
            res.sendFile(join(frontendDistPath, 'index.html'));
          } else {
            next();
          }
        });
        
        logger.log(`Static frontend files served from: ${frontendDistPath}`);
      } else {
        logger.warn('Frontend dist directory not found, frontend may be deployed separately');
      }
    } catch (error) {
      logger.warn(`Could not set up static file serving: ${error.message}`);
    }
  }

  // Global validation pipe with security settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Request size limit (10MB)
  app.use((req, res, next) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
      return res.status(413).json({ message: 'Request entity too large' });
    }
    next();
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
