import { Controller, Get, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Controller({ host: 'admin.lumipha.com' })
export class AdminController {
  // 1. Ana sayfa isteği (admin.lumipha.com/) geldiğinde admin.html gönder
  @Get()
  getAdminIndex(@Res() res: Response) {
    const filePath = join(process.cwd(), 'admin-panel', 'admin.html');
    return res.sendFile(filePath);
  }

  // 2. JS, CSS gibi dosyalar istendiğinde (admin.js vb.) klasörden gönder
  @Get(':file')
  getAdminFile(@Req() req: Request, @Res() res: Response) {
    const fileName = req.params.file;
    const filePath = join(process.cwd(), 'admin-panel', fileName);
    return res.sendFile(filePath);
  }
}
