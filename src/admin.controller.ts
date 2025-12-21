import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

// Basit bir Auth Guard örneği (geliştirilebilir)
class AdminAuthGuard {
  canActivate(req: Request): boolean {
    // Örnek: Session veya JWT kontrolü
    // return !!req.session?.adminUser;
    // Şimdilik herkes erişebilsin (geliştirilecek)
    return true;
  }
}

@Controller('admin-panel')
export class AdminController {
  private readonly adminRoot = join(process.cwd(), 'admin-panel');

  @Get(':file')
  async serveAdminFile(@Param('file') file: string, @Req() req: Request, @Res() res: Response) {
    // Basit guard (geliştirilecek)
    const guard = new AdminAuthGuard();
    if (!guard.canActivate(req)) {
      return res.status(403).send('Yetkisiz erişim');
    }
    // Güvenlik: ../ gibi path traversal engelle
    if (file.includes('..')) return res.status(400).send('Geçersiz dosya');
    const filePath = join(this.adminRoot, file);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return res.status(404).send('Dosya bulunamadı');
    }
    res.setHeader('Content-Disposition', `inline; filename="${file}"`);
    createReadStream(filePath).pipe(res);
  }
}
