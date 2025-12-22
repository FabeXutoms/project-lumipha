import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as xss from 'xss';

@Injectable()
export class OrderValidationMiddleware implements NestMiddleware {
  private schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    companyName: z.string().min(1, 'Company name is required'),
    businessType: z.string().min(1, 'Business type is required'),
    businessScale: z.string().min(1, 'Business scale is required'),
    phone: z.string().transform((val) => {
      // Allow only numbers
      const sanitized = val.replace(/[^0-9]/g, '');
      return sanitized;
    }).refine((val) => val.length >= 10, {
      message: 'Phone number must be at least 10 digits',
    }),
    email: z.string().email('Invalid email format'),
  });

  use(req: Request, res: Response, next: NextFunction) {
    if (Object.keys(req.body).length === 0) {
       throw new BadRequestException('Request body cannot be empty');
    }

    // 1. Sanitize all string inputs in req.body to prevent XSS
    this.sanitizeInput(req.body);

    // 2. Validate using Zod
    const result = this.schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    // 3. Replace body with parsed/transformed data (e.g. phone number stripped)
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
