// src/tracking/tracking.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common'; // UseGuards'ı ekle!
import { TrackingService } from './tracking.service';
import { ThrottlerGuard } from '@nestjs/throttler'; // ThrottlerGuard'ı ekle!

// TÜM KONTROL EDİCİYE KORUMAYI EKLE:
@UseGuards(ThrottlerGuard) 
@Controller('tracking')
export class TrackingController {
  // TypeScript artık TrackingService'in nereden geldiğini biliyor.
  constructor(private readonly trackingService: TrackingService) {} 

  @Get(':code')
  async getProjectStatus(@Param('code') code: string) {
    const projectData = await this.trackingService.getProjectByTrackingCode(code);
    
    // ... kalan kodun aynı kalacak ...
    return {
      success: true,
      trackingCode: projectData.trackingCode,
      status: projectData.status,
      packageName: projectData.packageName,
      clientName: projectData.client.name,
      totalAmount: projectData.totalAmount,
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