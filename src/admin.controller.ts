import { Controller, Get, Req, Res, HostParam } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';



@Controller()
export class AdminController {
  @Get()
  @HostParam('admin.lumipha.com')
  getAdminIndex(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', '..', 'admin-panel', 'admin.html'));
  }

  // Admin panelindeki JS ve CSS dosyalarını çekebilmesi için
  @Get('admin-panel/*')
  getAdminAssets(@Req() req: Request, @Res() res: Response) {
    const assetPath = req.params[0];
    return res.sendFile(join(__dirname, '..', '..', 'admin-panel', assetPath));
  }
}
