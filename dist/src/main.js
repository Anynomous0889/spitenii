"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const helmet = require("helmet");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
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
    const frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:5173';
    app.enableCors({
        origin: frontendUrl.split(',').map(url => url.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 86400,
    });
    const isProduction = process.env.NODE_ENV === 'production';
    const serveStaticFrontend = configService.get('SERVE_STATIC_FRONTEND') !== 'false';
    if (isProduction && serveStaticFrontend) {
        try {
            const possiblePaths = [
                (0, path_1.join)(__dirname, '../../frontend/dist'),
                (0, path_1.join)(__dirname, '../../../frontend/dist'),
                (0, path_1.join)(process.cwd(), 'frontend/dist'),
                (0, path_1.join)(process.cwd(), '../frontend/dist'),
            ];
            let frontendDistPath = null;
            const fs = require('fs');
            for (const path of possiblePaths) {
                try {
                    if (fs.existsSync(path) && fs.existsSync((0, path_1.join)(path, 'index.html'))) {
                        frontendDistPath = path;
                        break;
                    }
                }
                catch {
                }
            }
            if (frontendDistPath) {
                app.useStaticAssets(frontendDistPath, {
                    index: false,
                    prefix: '/',
                });
                app.use((req, res, next) => {
                    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
                        res.sendFile((0, path_1.join)(frontendDistPath, 'index.html'));
                    }
                    else {
                        next();
                    }
                });
                logger.log(`Static frontend files served from: ${frontendDistPath}`);
            }
            else {
                logger.warn('Frontend dist directory not found, frontend may be deployed separately');
            }
        }
        catch (error) {
            logger.warn(`Could not set up static file serving: ${error.message}`);
        }
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    app.use((req, res, next) => {
        if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
            return res.status(413).json({ message: 'Request entity too large' });
        }
        next();
    });
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map