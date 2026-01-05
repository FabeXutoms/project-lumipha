import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeliveryService {
    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async generateDownloadToken(projectId: number) {
        const project = await this.prisma.projectAction.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Proje bulunamadı.');
        }

        if (!project.projectLink) {
            throw new NotFoundException('Bu proje için indirme linki tanımlanmamış.');
        }

        const payload = { sub: projectId, type: 'download' };
        const token = this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: this.configService.get('JWT_SECRET')
        });

        // Return the full clickable URL (assuming default localhost for now, or from config)
        // In prod, this should come from ENV.
        const baseUrl = process.env.BASE_URL || 'https://www.lumipha.com'; // Default
        return {
            token,
            downloadUrl: `${baseUrl}/delivery/download?token=${token}`
        };
    }

    async validateAndGetLink(token: string) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET')
            });

            if (payload.type !== 'download') {
                throw new UnauthorizedException('Geçersiz token tipi.');
            }

            const project = await this.prisma.projectAction.findUnique({
                where: { id: payload.sub },
            });

            if (!project || !project.projectLink) {
                throw new NotFoundException('Proje veya link bulunamadı.');
            }

            return project.projectLink;

        } catch (e) {
            throw new UnauthorizedException('İndirme linki geçersiz veya süresi dolmuş.');
        }
    }
}
