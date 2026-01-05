import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // 1. Ana Sayfa (http://IP:3000/)
  @Get()
  getHomepage(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'homepage.html');
    return res.sendFile(filePath);
  }

  // 2. Senin İstediğin Kısa Link (http://IP:3000/admin)
  @Get('admin')
  getAdminPanel(@Res() res: Response) {
    // public -> admin-panel -> activeorders.html yolunu tam veriyoruz
    const filePath = join(process.cwd(), 'public', 'admin-panel', 'activeorders.html');

    // Güvenlik: Dosya gerçekten orada mı diye kontrol etmiyoruz, 
    // direkt gönderiyoruz; eğer 404 verirse dosya adı veya klasör adı hatalıdır.
    return res.sendFile(filePath);
  }

  // 3. Admin Giriş Sayfası (http://IP:3000/login)
  @Get('login')
  getAdminLogin(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'admin-panel', 'admin.html');
    return res.sendFile(filePath);
  }

  // API Sağlık Kontrolü
  @Get('api/health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}