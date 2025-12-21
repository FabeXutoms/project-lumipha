import { Controller, Get, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Controller({ host: 'admin.lumipha.com' }) // Sadece bu subdomain için çalışır
export class AdminController {
  @Get()
  getAdminIndex(@Res() res: Response) {
    // dist/src'den root/admin-panel'e çıkış
    const filePath = join(__dirname, '..', '..', 'admin-panel', 'admin.html');
    return res.sendFile(filePath);
  }

  @Get('*') // Admin panelindeki JS, CSS ve diğer tüm dosyalar için
  getAdminAssets(@Req() req: Request, @Res() res: Response) {
    const assetPath = req.path; // Gelen isteğin tam yolu
    const filePath = join(__dirname, '..', '..', 'admin-panel', assetPath);
    return res.sendFile(filePath);
  }
}
