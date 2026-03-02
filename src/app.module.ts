import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminController } from './admin.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service'; // <-- EKLENDİ
import { TrackingModule } from './tracking/tracking.module';
import { ThrottlerModule } from '@nestjs/throttler'; 
import { ConfigModule } from '@nestjs/config'; 
import { ServeStaticModule } from '@nestjs/serve-static'; 
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'), 
      serveRoot: '/',
      exclude: ['/api/(.*)', '/tracking/(.*)', '/project/(.*)', '/contact/(.*)'], 
      serveStaticOptions: {
        index: false, 
        fallthrough: true,
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 20,  
    }]),
    PrismaModule,
    TrackingModule, ProjectModule, MailModule, ContactModule, CommonModule, AuthModule, DeliveryModule
  ],
  controllers: [AdminController, AppController],
  // 👇 İŞTE BÜTÜN SORUNU ÇÖZEN KÜÇÜK EKLEME BURADA (PrismaService'i ekledik) 👇
  providers: [AppService, AppLogger], 
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OrderValidationMiddleware)
      .forRoutes({ path: 'projects', method: RequestMethod.POST });
  }
}