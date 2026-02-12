"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.isConnected = false;
    }
    async onModuleInit() {
        const redisUrl = this.configService.get('REDIS_URL');
        if (!redisUrl) {
            this.logger.warn('REDIS_URL not set, Redis features will be disabled');
            return;
        }
        try {
            this.client = (0, redis_1.createClient)({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            this.logger.error('Redis reconnection failed after 10 attempts');
                            return new Error('Redis connection failed');
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });
            this.client.on('error', (err) => {
                this.logger.error(`Redis error: ${err.message}`);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                this.logger.log('Redis connected');
                this.isConnected = true;
            });
            await this.client.connect();
        }
        catch (error) {
            this.logger.error(`Failed to connect to Redis: ${error.message}`);
            this.isConnected = false;
        }
    }
    async onModuleDestroy() {
        if (this.client && this.isConnected) {
            await this.client.quit();
        }
    }
    async ensureConnected() {
        if (!this.client || !this.isConnected) {
            return false;
        }
        try {
            await this.client.ping();
            return true;
        }
        catch {
            this.isConnected = false;
            return false;
        }
    }
    async get(key) {
        if (!(await this.ensureConnected())) {
            return null;
        }
        try {
            return await this.client.get(key);
        }
        catch (error) {
            this.logger.error(`Redis get error: ${error.message}`);
            return null;
        }
    }
    async set(key, value, expirySeconds) {
        if (!(await this.ensureConnected())) {
            return;
        }
        try {
            if (expirySeconds) {
                await this.client.setEx(key, expirySeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            this.logger.error(`Redis set error: ${error.message}`);
        }
    }
    async incr(key) {
        if (!(await this.ensureConnected())) {
            return 0;
        }
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            this.logger.error(`Redis incr error: ${error.message}`);
            return 0;
        }
    }
    async expire(key, seconds) {
        if (!(await this.ensureConnected())) {
            return;
        }
        try {
            await this.client.expire(key, seconds);
        }
        catch (error) {
            this.logger.error(`Redis expire error: ${error.message}`);
        }
    }
    async del(key) {
        if (!(await this.ensureConnected())) {
            return;
        }
        try {
            await this.client.del(key);
        }
        catch (error) {
            this.logger.error(`Redis del error: ${error.message}`);
        }
    }
    async exists(key) {
        if (!(await this.ensureConnected())) {
            return 0;
        }
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            this.logger.error(`Redis exists error: ${error.message}`);
            return 0;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map