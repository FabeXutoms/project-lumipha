import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as xss from 'xss';

@Injectable()
export class OrderValidationMiddleware implements NestMiddleware {
  // SCHEMA GÜNCELLENDİ: Artık senin gönderdiğin clientName vb. alanları bekliyor
  private schema = z.object({
    clientName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
    companyName: z.string().min(1, 'İşletme adı zorunludur'),
    businessType: z.string().min(1, 'İşletme türü zorunludur'),
    businessScale: z.string().min(1, 'İşletme ölçeği zorunludur'),
    packageName: z.string().optional(), // Paket ismi gelirse kabul et
    clientPhone: z.string().transform((val) => {
      // Sadece rakamları al
      const sanitized = val.replace(/[^0-9]/g, '');
      return sanitized;
    }).refine((val) => val.length >= 10, {
      message: 'Telefon numarası en az 10 haneli olmalıdır',
    }),
    clientEmail: z.string().email('Geçersiz e-posta formatı'),
    totalAmount: z.any().optional(), // Formdan 0 geliyor, hata vermesin
  });

  use(req: Request, res: Response, next: NextFunction) {
    // Sadece POST /projects (sipariş oluşturma) isteğinde çalışsın
    if (req.method !== 'POST') {
      return next();
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      throw new BadRequestException('İstek gövdesi boş olamaz');
    }

    // 1. XSS Temizliği
    this.sanitizeInput(req.body);

    // 2. Zod ile Doğrulama
    const result = this.schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      // console.log('--- Middleware Doğrulama Hatası ---', errorMessages); // GÜVENLİK: Hassas hata detayı loglama kapatıldı

      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // 3. Temizlenmiş veriyi body'e geri yaz
    req.body = result.data;

    next();
  }

  private sanitizeInput(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss.filterXSS(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeInput(obj[key]);
      }
    }
  }
}