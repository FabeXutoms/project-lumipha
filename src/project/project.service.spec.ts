import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { MailService } from '../mail/mail.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [ProjectService],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should encrypt email and phone when creating a project', async () => {
    const createDto = {
      clientName: 'Test',
      clientEmail: 'test@example.com',
      clientPhone: '1234567890',
      packageName: 'Pack',
      totalAmount: 100
    };

    // Mocks
    const prisma = module.get(PrismaService);
    const encryption = module.get(EncryptionService);

    (prisma.client.findUnique as jest.Mock).mockResolvedValue(null); // No existing email hash
    (prisma.client.findFirst as jest.Mock).mockResolvedValue(null); // No existing phone hash

    // Spy on transaction to check what's passed to create
    const transactionSpy = jest.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const prismaMock = {
        client: {
          create: jest.fn().mockResolvedValue({ id: 1, email: 'encrypted_test@example.com' }),
        },
        projectAction: {
          create: jest.fn().mockResolvedValue({ id: 10, trackingCode: 'ABC' }),
        },
      };
      await cb(prismaMock);

      // ASSERT INSIDE TRANSACTION
      expect(prismaMock.client.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          email: 'encrypted_test@example.com',
          emailHash: 'hashed_test@example.com',
          phone: 'encrypted_1234567890',
          phoneHash: 'hashed_1234567890'
        })
      }));

      return { success: true };
    });

    try {
      await service.createNewProject(createDto as any);
    } catch (e) {
      console.error('TEST ERROR:', e);
      throw e;
    }

    expect(encryption.hash).toHaveBeenCalledWith('test@example.com');
    expect(encryption.encrypt).toHaveBeenCalledWith('test@example.com');
    expect(transactionSpy).toHaveBeenCalled();
  });
});
