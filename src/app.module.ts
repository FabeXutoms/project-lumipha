import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminController } from './admin.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TrackingModule } from './tracking/tracking.module';
import { ThrottlerModule } from '@nestjs/throttler'; // İçe aktar
import { ConfigModule } from '@nestjs/config'; // İçe aktar
import { ServeStaticModule } from '@nestjs/serve-static'; // Statik dosyalar için
import { join } from 'path';
import { ProjectModule } from './project/project.module';
import { AppLogger } from './common/logger/logger.service';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './contact/contact.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { DeliveryModule } from './delivery/delivery.module';
import { OrderValidationMiddleware } from './common/middleware/order-validation.middleware';



@Module({
  imports: [
    // .env dosyasını uygulama genelinde kullanılabilir yap
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Statik dosyaları sun (HTML, CSS, JS, images)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'), // <--- DİKKAT: Yanına 'public' ekledik!
      serveRoot: '/',
      exclude: ['/api/(.*)', '/tracking/(.*)', '/project/(.*)', '/contact/(.*)'], // API çakışmasın diye regex yaptık
      serveStaticOptions: {
        index: false, // Otomatik index'i kapattık, kontrol sende olsun
        fallthrough: true,
      },
    }),

    // Rate Limiting'i kuruyoruz:
    ThrottlerModule.forRoot([{
      // 60 saniyede (süre) en fazla 20 istek (limit) izin ver.
      ttl: 60000, // 60 saniye (milisaniye cinsinden)
      limit: 20,  // Maksimum 20 istek
    }]),

    PrismaModule,
    TrackingModule, ProjectModule, MailModule, ContactModule, CommonModule, AuthModule, DeliveryModule
  ],
  controllers: [AdminController, AppController],
  providers: [AppService, AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OrderValidationMiddleware)
      .forRoutes({ path: 'projects', method: RequestMethod.POST });
  }
}