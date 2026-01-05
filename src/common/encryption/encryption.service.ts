import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
    private readonly encryptionKey: Buffer;
    private readonly hashPepper: string;
    private readonly algorithm = 'aes-256-cbc';

    constructor(private configService: ConfigService) {
        const key = this.configService.get<string>('ENCRYPTION_KEY');
        const pepper = this.configService.get<string>('HASH_PEPPER');

        if (!key || !pepper) {
            throw new Error('ENCRYPTION_KEY or HASH_PEPPER is not defined in environment variables');
        }

        // Ensure key is 32 bytes (64 hex characters)
        this.encryptionKey = Buffer.from(key, 'hex');
        this.hashPepper = pepper;
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(text: string): string {
        const parts = text.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted text format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    hash(text: string): string {
        return crypto.createHmac('sha256', this.hashPepper)
            .update(text)
            .digest('hex');
    }
}
