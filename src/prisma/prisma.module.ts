// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Opsiyonel: Dışa aktardıktan sonra bu modülü diğer modüllere import etme zorunluluğunu kaldırır.
@Module({
  providers: [PrismaService],
  // KRİTİK ADIM: PrismaService'i dışa aktar, böylece TrackingService onu kullanabilir.
  exports: [PrismaService], 
})
export class PrismaModule {}