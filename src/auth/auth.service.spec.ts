import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
    admin: {
        findMany: jest.fn(),
    },
};

const mockJwt = {
    sign: jest.fn(() => 'test_token'),
};

const mockConfig = {
    get: jest.fn().mockReturnValue('secret'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwt },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should return token if password matches one of the admins', async () => {
        const password = 'emirhanPass123';
        const hash = await bcrypt.hash(password, 10);

        // Reset mocks
        mockPrisma.admin.findMany.mockResolvedValue([
            { id: 1, name: 'Emirhan', passwordHash: hash },
            { id: 2, name: 'Yavuz', passwordHash: 'otherhash' }
        ]);

        const result = await service.loginWithPassword(password);

        expect(result).toHaveProperty('access_token');
        expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 1, name: 'Emirhan' });
    });

    it('should throw exception if password matches none', async () => {
        mockPrisma.admin.findMany.mockResolvedValue([
            { id: 1, name: 'Emirhan', passwordHash: 'hash' }
        ]);

        await expect(service.loginWithPassword('wrongpass')).rejects.toThrow();
    });
});
