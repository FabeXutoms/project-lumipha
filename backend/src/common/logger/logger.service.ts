// src/common/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // Genel log seviyesi
      format: winston.format.json(),
      transports: [
        // 1. Konsola yaz: Hata ayıklama için kullanırız
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
        // 2. Kritik hataları dosyaya yaz
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        // 3. Tüm (info, warn, error) logları dosyaya yaz
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}