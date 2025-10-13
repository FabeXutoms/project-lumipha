// src/tracking/tracking.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getProjectByTrackingCode(trackingCode: string) {
    // trackingCode ile ProjectAction kaydını bul.
    const projectAction = await this.prisma.projectAction.findUnique({
      where: {
        trackingCode: trackingCode.toUpperCase(), // Kodları büyük harfe çevirerek arayalım
      },
      // İlişkili Client (Müşteri) ve Payments (Ödemeler) bilgilerini de çek.
      include: {
        client: {
          // Müşterinin sadece adını ve e-postasını çek, hassas verileri gizle.
          select: { name: true, email: true }, 
        },
        payments: true,
      },
    });

    if (!projectAction) {
      // Eğer kod bulunamazsa 404 hatası döndür
      throw new NotFoundException(`Tracking code '${trackingCode}' not found.`);
    }

    return projectAction;
  }
}