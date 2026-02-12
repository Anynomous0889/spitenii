import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly algorithm;
    private key;
    constructor(configService: ConfigService);
    encrypt(text: string): Promise<string>;
    decrypt(encryptedText: string): Promise<string>;
}
