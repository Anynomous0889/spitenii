const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { join } = require('path');

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const { AppModule } = require('../dist/app.module');
  const app = await NestFactory.create(AppModule, adapter, {
    logger: false,
  });

  const { ConfigService } = require('@nestjs/config');
  const configService = app.get(ConfigService);
  
  // CORS - allow all origins in serverless (Vercel handles this)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
  });

  // Serve static frontend files if they exist
  const serveStaticFrontend = configService.get('SERVE_STATIC_FRONTEND') !== 'false';
  if (serveStaticFrontend) {
    try {
      const fs = require('fs');
      const possiblePaths = [
        join(__dirname, '../../frontend/dist'),
        join(__dirname, '../../../frontend/dist'),
        join(process.cwd(), 'frontend/dist'),
        join(process.cwd(), '../frontend/dist'),
      ];
      
      let frontendDistPath = null;
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
        expressApp.use(express.static(frontendDistPath));
        
        // Backend API routes (no /api prefix in this project)
        const apiRoutes = ['/auth', '/users', '/invoices', '/sales', '/expenses', 
                          '/inventory', '/payroll', '/dashboard', '/health'];
        
        // Serve index.html for non-API routes
        expressApp.get('*', (req, res, next) => {
          const isApiRoute = apiRoutes.some(route => req.path.startsWith(route));
          if (!isApiRoute) {
            res.sendFile(join(frontendDistPath, 'index.html'));
          } else {
            next();
          }
        });
      }
    } catch (error) {
      // Frontend not available, continue without static serving
    }
  }

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
