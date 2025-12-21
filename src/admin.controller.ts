import { Controller, Get, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Controller({ host: 'admin.lumipha.com' })
export class AdminController {
  // 1. Ana sayfa (admin.html)
  @Get()
  getAdminIndex(@Res() res: Response) {
    const filePath = join(process.cwd(), 'admin-panel', 'admin.html');
    return res.sendFile(filePath);
  }

  // 2. TÜM alt klasörler ve dosyalar için (images, fonts, js, css)
  @Get('*')
  getAdminAssets(@Req() req: Request, @Res() res: Response) {
    // req.path bize '/images/logo.png' veya '/fonts/font.ttf' gibi tam yolu verir
    const assetPath = req.path;
    const filePath = join(process.cwd(), 'admin-panel', assetPath);

    return res.sendFile(filePath, (err) => {
      if (err) {
        // Dosya bulunamazsa 404 ver ama sistemi çökertme
        res.status(404).send('Dosya bulunamadı dayı: ' + assetPath);
      }
    });
  }
}
