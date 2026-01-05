import { Controller, Get, Post, Param, Query, Res, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('delivery')
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) { }

    // Admin Only: Generate Link
    @UseGuards(JwtAuthGuard)
    @Post(':projectId/sign')
    async generateSignedLink(@Param('projectId') projectId: string) {
        return this.deliveryService.generateDownloadToken(parseInt(projectId, 10));
    }

    // Public: Download (Redirect)
    @Get('download')
    async download(@Query('token') token: string, @Res() res: Response) {
        if (!token) {
            throw new HttpException('Token gereklidir.', HttpStatus.BAD_REQUEST);
        }

        try {
            const targetUrl = await this.deliveryService.validateAndGetLink(token);
            return res.redirect(targetUrl);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
