import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Ana sayfa - homepage.html'e yönlendir
  @Get()
  getHomepage(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'homepage.html'));
  }

  // API health check endpoint
  @Get('api/health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
