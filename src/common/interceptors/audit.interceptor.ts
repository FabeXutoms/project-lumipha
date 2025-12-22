import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, body } = request;

        // Only log write operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            if (user && user.userId) { // Check if user is authenticated
                return next.handle().pipe(
                    tap(async () => {
                        try {
                            await this.prisma.auditLog.create({
                                data: {
                                    adminId: user.userId,
                                    action: `${method}`,
                                    targetEndpoint: url,
                                    payload: JSON.stringify(body || {}),
                                }
                            });
                        } catch (err) {
                            console.error('Audit Logging Failed:', err);
                        }
                    })
                );
            }
        }

        return next.handle();
    }
}
