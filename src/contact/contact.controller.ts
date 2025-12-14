import { Controller, Post, Get, Patch, Delete, Param, Body, BadRequestException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Yeni mesaj oluştur (müşteri tarafından)
  @Post()
  async createMessage(@Body() dto: CreateContactMessageDto) {
    try {
      // DTO validasyonunu manuel olarak yap
      const dtoInstance = plainToClass(CreateContactMessageDto, dto);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        // Hataları birleştir
        const errorMessages = errors
          .flatMap((error) => Object.values(error.constraints || {}))
          .join(' ');
        throw new BadRequestException(errorMessages);
      }

      const message = await this.contactService.createMessage(dto);
      return {
        success: true,
        message: 'Mesajınız başarıyla alındı. Size en kısa sürede dönüş yapacağız.',
        data: message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Mesaj gönderilirken bir hata oluştu.',
        error: error.message,
      };
    }
  }

  // Tüm mesajları getir (admin için)
  @Get()
  async getAllMessages() {
    try {
      const messages = await this.contactService.getAllMessages();
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Mesajlar alınırken bir hata oluştu.',
        error: error.message,
      };
    }
  }

  // Okunmamış mesajları getir
  @Get('unread')
  async getUnreadMessages() {
    try {
      const messages = await this.contactService.getUnreadMessages();
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Okunmamış mesajlar alınırken bir hata oluştu.',
        error: error.message,
      };
    }
  }

  // Mesajı okundu olarak işaretle
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      const message = await this.contactService.markAsRead(parseInt(id, 10));
      return {
        success: true,
        message: 'Mesaj okundu olarak işaretlendi.',
        data: message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'İşlem sırasında bir hata oluştu.',
        error: error.message,
      };
    }
  }

  // Mesajı sil
  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    try {
      await this.contactService.deleteMessage(parseInt(id, 10));
      return {
        success: true,
        message: 'Mesaj silindi.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Mesaj silinirken bir hata oluştu.',
        error: error.message,
      };
    }
  }
}
