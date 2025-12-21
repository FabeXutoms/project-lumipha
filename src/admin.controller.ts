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
        // URL'den gelen temiz yolu al (başındaki gereksiz ifadeleri temizle)
        const assetPath = req.path.replace(/^\/admin\//, '');
        const filePath = join(process.cwd(), 'admin-panel', assetPath);

        return res.sendFile(filePath, (err) => {
            if (err) {
                // Eğer dosya bulunamazsa hata verme, logla ki görelim
                console.log('Bulunamayan dosya yolu:', filePath);
                res.status(404).end();
            }
        });
    }
}
