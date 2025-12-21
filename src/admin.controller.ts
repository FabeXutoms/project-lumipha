import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

// Basit bir Auth Guard örneği (geliştirilebilir)
class AdminAuthGuard {
  canActivate(req: Request): boolean {
    // Gerçek bir session/JWT kontrolü ekleyin
    // Örnek: return !!req.session?.adminUser;
    // Örnek JWT: return !!req.cookies?.admin_jwt;
    return !!req.session?.adminUser || !!req.cookies?.admin_jwt;
  }
}

@Controller('admin')
export class AdminController {
  private readonly adminRoot = join(process.cwd(), 'admin-panel');

  // Ana rota: admin.lumipha.com/ veya /admin => admin.html
  @Get()
  async serveAdminRoot(@Req() req: Request, @Res() res: Response) {
    const guard = new AdminAuthGuard();
    if (!guard.canActivate(req)) {
      // Giriş yoksa login sayfasına yönlendir
      return res.redirect('/admin/login.html');
    }
    const filePath = join(this.adminRoot, 'admin.html');
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return res.status(404).send('admin.html bulunamadı');
    }
    res.setHeader('Content-Type', 'text/html');
    createReadStream(filePath).pipe(res);
  }

  // /admin/login.html => login sayfası (herkese açık)
  @Get('login.html')
  async serveLogin(@Res() res: Response) {
    const filePath = join(this.adminRoot, 'login.html');
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return res.status(404).send('login.html bulunamadı');
    }
    res.setHeader('Content-Type', 'text/html');
    createReadStream(filePath).pipe(res);
  }

  // /admin/:file => Diğer dosyalar (sadece giriş yapanlara)
  @Get(':file')
  async serveAdminFile(@Param('file') file: string, @Req() req: Request, @Res() res: Response) {
    const guard = new AdminAuthGuard();
    if (!guard.canActivate(req)) {
      return res.redirect('/admin/login.html');
    }
    if (file.includes('..')) return res.status(400).send('Geçersiz dosya');
    const filePath = join(this.adminRoot, file);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return res.status(404).send('Dosya bulunamadı');
    }
    // İçerik tipi otomatik belirlenebilir, örnek olarak sadece html/js/css için ekleyelim
    if (file.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
    else if (file.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
    else if (file.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
    else res.setHeader('Content-Disposition', `inline; filename="${file}"`);
    createReadStream(filePath).pipe(res);
  }
}
