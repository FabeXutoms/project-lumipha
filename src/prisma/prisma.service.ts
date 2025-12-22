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
          url: "mysql://lumipha:Lumipha2025@127.0.0.1:3306/lumipha_db"
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