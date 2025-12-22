import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async loginWithPassword(password: string) {
        const admins = await this.prisma.admin.findMany();

        for (const admin of admins) {
            const isMatch = await bcrypt.compare(password, admin.passwordHash);
            if (isMatch) {
                return this.generateToken(admin);
            }
        }

        throw new UnauthorizedException('Invalid credentials');
    }

    private generateToken(admin: any) {
        const payload = { sub: admin.id, name: admin.name };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
