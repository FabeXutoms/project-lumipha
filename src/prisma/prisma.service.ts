import {
  INestApplication,
  Injectable,
  OnModuleInit,
  OnModuleDestroy
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()

export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  constructor() {
    super({
      datasources: {
        db: {
          // BURAYA .env İÇİNDEKİ DATABASE_URL'İ DİREKT YAZIYORUZ
          url: process.env.DATABASE_URL
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log("✅ Veritabanı bağlantısı başarılı! (3306)");
    } catch (error) {
      console.error("❌ Veritabanı bağlantı hatası:", error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}