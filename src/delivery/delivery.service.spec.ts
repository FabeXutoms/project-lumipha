import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from './delivery.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Mock Prismas
const mockPrisma = {
    projectAction: {
        findUnique: jest.fn(),
    },
};

const mockJwt = {
    sign: jest.fn(() => 'token'),
    verify: jest.fn(() => ({ sub: 1, type: 'download' })),
};

const mockConfig = {
    get: jest.fn().mockReturnValue('secret'),
};

describe('DeliveryService', () => {
    let service: DeliveryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeliveryService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwt },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<DeliveryService>(DeliveryService);
    });

    it('should generate a token for a valid project', async () => {
        mockPrisma.projectAction.findUnique.mockResolvedValue({ id: 1, projectLink: 'https://example.com' });
        const result = await service.generateDownloadToken(1);
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('downloadUrl');
    });

    it('should return link if token is valid', async () => {
        mockPrisma.projectAction.findUnique.mockResolvedValue({ id: 1, projectLink: 'https://example.com' });
        const link = await service.validateAndGetLink('token');
        expect(link).toBe('https://example.com');
    });
});
