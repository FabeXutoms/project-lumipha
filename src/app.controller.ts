import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service'; // <-- Prisma'yı çağırdık

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService // <-- Prisma'yı dükkana aldık
  ) { }

  // 1. Ana Sayfa (http://IP:3000/)
  @Get()
  getHomepage(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'homepage.html');
    return res.sendFile(filePath);
  }

  // 2. Senin İstediğin Kısa Link (http://IP:3000/admin)
  @Get('admin')
  getAdminPanel(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'admin-panel', 'activeorders.html');
    return res.sendFile(filePath);
  }

  // 3. Admin Giriş Sayfası (http://IP:3000/login)
  @Get('login')
  getAdminLogin(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'admin-panel', 'admin.html');
    return res.sendFile(filePath);
  }

  // API Sağlık Kontrolü (Aiven'i uyanık tutan zilimiz)
  @Get('api/health')
  async getHealth() {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return {
        status: 'ok',
        database: 'running',
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'sleeping or disconnected',
      };
    }
  }
}