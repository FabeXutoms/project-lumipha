// src/auth/api-key.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // .env dosyasından okumak için

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // Gelen HTTP isteğini al
    const request = context.switchToHttp().getRequest();
    
    // Authorization başlığını al (X-API-KEY veya Authorization: Bearer kullanabiliriz)
    const apiKey = request.headers['x-api-key'];

    // .env dosyasındaki gizli anahtarı al
    const secretKey = this.configService.get<string>('API_KEY_SECRET');

    // Anahtar kontrolü:
    if (!apiKey || apiKey !== secretKey) {
      // Eğer anahtar yoksa veya eşleşmiyorsa, 401 Unauthorized hatası fırlat
      throw new UnauthorizedException('Invalid API Key');
    }

    // Anahtar geçerliyse, isteğe izin ver
    return true;
  }
}