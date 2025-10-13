// src/prisma/prisma.service.ts
import { 
  INestApplication, 
  Injectable, 
  OnModuleInit, 
  OnModuleDestroy // BU KISMI EKLE
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
// OnModuleDestroy arayüzünü ekle
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Servis başlatıldığında veritabanı bağlantısını kur
  async onModuleInit() {
    await this.$connect();
  }

  // UYGULAMA KAPANDIĞINDA BAĞLANTIYI KESEN METOD
  async onModuleDestroy() {
    await this.$disconnect();
  }
  
  // enableShutdownHooks metodunu artık kullanmıyoruz, silebilirsin.
  // Eğer ihtiyacın olursa diye sadece bir kez nasıl kullanılabileceğini göstereyim:
  /*
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
  */
}