declare class EnvironmentVariables {
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    ENCRYPTION_KEY: string;
    DATABASE_URL: string;
    REDIS_URL?: string;
    FRONTEND_URL?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: number;
    SMTP_USER?: string;
    SMTP_PASSWORD?: string;
    SMTP_FROM?: string;
    PORT?: number;
}
export declare function validateEnv(config: Record<string, unknown>): EnvironmentVariables;
export {};
