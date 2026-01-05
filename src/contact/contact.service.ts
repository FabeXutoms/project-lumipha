import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Mesaj oluştur ve email gönder
  async createMessage(dto: CreateContactMessageDto) {
    // Email içeriğini hazırla
    const emailBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
        <h2>Yeni İletişim Formu Mesajı</h2>
        <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 20px 0;">
        
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Ad Soyadı:</strong> ${dto.fullName}</p>
          <p><strong>Email:</strong> ${dto.email}</p>
          <p><strong>Telefon:</strong> ${dto.phone}</p>
          <p><strong>Gönderme Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        </div>
        
        <h3>Mesaj:</h3>
        <div style="background-color: #f0f0f0; padding: 16px; border-left: 4px solid #000; border-radius: 4px; white-space: pre-wrap;">
${dto.message}
        </div>
        
        <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Bu bir otomatik email'dir. Doğrudan bu mesajı yanıtlayabilir veya göndericinin email adresine yazabilirsiniz.</p>
      </div>
    `;

    // Email gönder
    await this.mailService.sendContactEmail(
      'lumiphaofficial@gmail.com',
      `Yeni İletişim Formu - ${dto.fullName}`,
      emailBody,
    );

    return {
      success: true,
      message: 'Mesajınız başarıyla alındı. Size en kısa sürede dönüş yapacağız.',
    };
  }

  // Tüm mesajları getir (admin için)
  async getAllMessages() {
    return this.prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Okunmamış mesajları getir
  async getUnreadMessages() {
    return this.prisma.contactMessage.findMany({
      where: {
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Mesajı okundu olarak işaretle
  async markAsRead(id: number) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // Mesajı sil
  async deleteMessage(id: number) {
    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }
}
