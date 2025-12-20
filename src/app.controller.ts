import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // 1. Ana sayfa - http://IP:3000/ yazınca homepage.html açılır
  @Get()
  getHomepage(@Res() res: Response) {
    // Dosyaları public klasörüne taşıdığımız için yolu güncelledik
    return res.sendFile(join(process.cwd(), 'public', 'homepage.html'));
  }

  // 2. Kısa Admin Linki - http://IP:3000/admin yazınca direkt aktif siparişler açılır
  @Get('admin')
  getAdminPanel(@Res() res: Response) {
    // İstediğin sayfa admin-panel klasörünün içindeki activeorders.html idi
    return res.sendFile(join(process.cwd(), 'public', 'admin-panel', 'activeorders.html'));
  }

  // 3. Eğer sadece admin paneline giriş sayfasını istersen (Alternatif olarak dursun)
  @Get('login')
  getAdminLogin(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'admin-panel', 'admin.html'));
  }

  // 4. API Sağlık Kontrolü
  @Get('api/health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}