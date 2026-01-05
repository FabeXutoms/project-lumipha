// src/tracking/tracking.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common'; // UseGuards'ı ekle!
import { TrackingService } from './tracking.service';
import { ThrottlerGuard } from '@nestjs/throttler'; // ThrottlerGuard'ı ekle!

import { EncryptionService } from '../common/encryption/encryption.service'; // Import EncryptionService

// TÜM KONTROL EDİCİYE KORUMAYI EKLE:
@UseGuards(ThrottlerGuard)
@Controller('tracking')
export class TrackingController {
  // TypeScript artık TrackingService'in nereden geldiğini biliyor.
  constructor(
    private readonly trackingService: TrackingService,
    private readonly encryptionService: EncryptionService, // Inject EncryptionService
  ) { }

  @Get(':code')
  async getProjectStatus(@Param('code') code: string) {
    const projectData = await this.trackingService.getProjectByTrackingCode(code);

    let decodedEmail = projectData.client.email;
    let decodedPhone = projectData.client.phone;

    try {
      if (decodedEmail && decodedEmail.includes(':')) {
        decodedEmail = this.encryptionService.decrypt(decodedEmail);
      }
    } catch (e) {
      // Decryption failed or not encrypted, keep original
    }

    try {
      if (decodedPhone && decodedPhone.includes(':')) {
        decodedPhone = this.encryptionService.decrypt(decodedPhone);
      }
    } catch (e) {
      // Decryption failed or not encrypted, keep original
    }

    return {
      success: true,
      trackingCode: projectData.trackingCode,
      status: projectData.status,
      packageName: projectData.packageName,
      clientName: projectData.client.name,
      totalAmount: projectData.totalAmount,
      clientEmail: decodedEmail, // E-posta (Decrypted)
      clientPhone: decodedPhone, // Telefon (Decrypted)
      companyName: projectData.companyName,  // Şirket Adı
      projectLink: projectData.projectLink,  // Teslim linki
      paymentsMade: projectData.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0),
      paymentDetails: projectData.payments.map(p => ({
        amount: p.amount.toNumber(),
        date: p.paymentDate,
        method: p.paymentMethod
      })),
      startDate: projectData.startDate,
      estimatedEndDate: projectData.estimatedEndDate
    };
  }
}