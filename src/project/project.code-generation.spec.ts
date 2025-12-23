
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { MailService } from '../mail/mail.service';

describe('ProjectService Code Generation', () => {
    let service: ProjectService;

    beforeEach(async () => {
        // Mock providers to avoid dependency issues
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectService,
                {
                    provide: PrismaService,
                    useValue: {}
                },
                {
                    provide: EncryptionService,
                    useValue: {}
                },
                {
                    provide: MailService,
                    useValue: {}
                },
            ],
        }).compile();

        service = module.get<ProjectService>(ProjectService);
    });

    it('should generate a tracking code starting with # and having 9 characters total', () => {
        // Access private method using 'any' casting or testing public side effect if possible
        // Since it's private, we can either make it public for testing or test via createNewProject.
        // However, creating a project needs too many mocks. 
        // Typescript allows accessing private members with array notation or any cast for testing.

        const code = (service as any).generateTrackingCode();
        console.log('Generated Code:', code);

        expect(code).toMatch(/^#[A-Za-z0-9]{8}$/);
        expect(code.length).toBe(9);
        expect(code.startsWith('#')).toBe(true);
    });

    it('should generate different codes on subsequent calls', () => {
        const code1 = (service as any).generateTrackingCode();
        const code2 = (service as any).generateTrackingCode();
        expect(code1).not.toEqual(code2);
    });
});
