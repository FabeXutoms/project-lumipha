// src/common/filters/http-exception.filter.ts
import { 
  Catch, 
  ArgumentsHost, 
  ExceptionFilter, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { AppLogger } from '../../logger/logger.service';  // Yeni logger'ı import et!

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {} // Logger'ı constructor'a ekle

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // HTTP Hatalarını ve Sistem Hatalarını ayrıştırma
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = 
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // *** KRİTİK LOGLAMA KISMI ***
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method} ${request.url}] Sunucu Hatası: ${message}`,
        (exception as Error).stack, // Hatanın stack trace'ini logla
        HttpExceptionFilter.name,
      );
    } else {
      this.logger.warn(
        `[${request.method} ${request.url}] İstemci Hatası: ${status} - ${JSON.stringify(message)}`,
        HttpExceptionFilter.name,
      );
    }
    // ****************************

    // İstemciye geri dönülecek yanıt
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}