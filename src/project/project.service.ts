import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Prisma } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ProjectService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    // --- YARDIMCI FONKSİYONLAR ---

    private generateTrackingCode(): string {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const datePart = new Date().getFullYear().toString().substring(2);
        return `AJ${datePart}${randomPart}`;
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // --- PROJE İŞLEMLERİ ---

    // 1. DURUM GÜNCELLEME
    async updateProjectStatus(projectId: number, dto: UpdateStatusDto) {
        try {
            const updatedProject = await this.prisma.projectAction.update({
                where: { id: projectId },
                data: {
                    status: dto.status,
                    estimatedEndDate: dto.status === 'Completed' ? new Date() : undefined,
                },
            });

            return {
                success: true,
                message: `Proje durumu güncellendi: ${dto.status}`,
                projectId: updatedProject.id,
                newStatus: updatedProject.status,
            };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Proje ID ${projectId} bulunamadı.`);
            }
            throw error;
        }
    }

    // 2. YENİ PROJE OLUŞTURMA
    async createNewProject(dto: CreateProjectDto) {
        const existingEmail = await this.prisma.client.findUnique({
            where: { email: dto.clientEmail },
        });
        if (existingEmail) {
            throw new ConflictException('Bu e-posta adresi zaten sistemde kayıtlı!');
        }

        if (dto.clientPhone) {
            const existingPhone = await this.prisma.client.findFirst({
                where: { phone: dto.clientPhone },
            });
            if (existingPhone) {
                throw new ConflictException('Bu telefon numarası zaten sistemde kayıtlı!');
            }
        }

        const client = await this.prisma.client.create({
            data: {
                name: dto.clientName,
                email: dto.clientEmail,
                phone: dto.clientPhone,
            },
        });

        const trackingCode = this.generateTrackingCode();
        const decimalAmount = new Prisma.Decimal(dto.totalAmount || 0);

        const newProject = await this.prisma.projectAction.create({
            data: {
                clientId: client.id,
                trackingCode: trackingCode,
                packageName: dto.packageName,
                totalAmount: decimalAmount,
                startDate: new Date(),
                status: 'WaitingForApproval',

                companyName: dto.companyName,
                businessType: dto.businessType,
                businessScale: dto.businessScale,
            },
        });

        return {
            success: true,
            message: 'Proje ve Müşteri oluşturuldu.',
            trackingCode: newProject.trackingCode,
            projectId: newProject.id,
            clientId: client.id
        };
    }

    // 3. ÖDEME KAYDETME
    async recordPayment(dto: CreatePaymentDto) {
        const existingPayment = await this.prisma.payment.findUnique({
            where: { transactionId: dto.transactionId },
        });

        if (existingPayment) {
            throw new ConflictException('Bu işlem ID\'si daha önce kullanılmış.');
        }

        const payment = await this.prisma.payment.create({
            data: {
                projectActionId: dto.projectId,
                amount: new Prisma.Decimal(dto.amount),
                paymentMethod: dto.paymentMethod,
                transactionId: dto.transactionId,
            },
        });

        await this.prisma.projectAction.update({
            where: { id: dto.projectId },
            data: { status: 'InProgress' },
        });

        return {
            success: true,
            message: 'Ödeme kaydedildi.',
            paymentId: payment.id
        };
    }

    // 4. TÜM PROJELERİ LİSTELEME
    async findAllProjects() {
        const projects = await this.prisma.projectAction.findMany({
            orderBy: { startDate: 'desc' },
            select: {
                id: true,
                trackingCode: true,
                startDate: true,
                status: true,
                totalAmount: true,
                projectLink: true,
                payments: { select: { amount: true } },
                client: { select: { name: true, email: true, phone: true } }
            }
        });

        return projects.map(p => {
            const totalPaid = p.payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
            const amount = Number(p.totalAmount);

            return {
                id: p.id,
                trackingCode: p.trackingCode,
                startDate: p.startDate,
                status: p.status,
                clientName: p.client.name,
                clientEmail: p.client.email,
                clientPhone: p.client.phone,
                isPaid: totalPaid >= amount && amount > 0,
                totalAmount: amount,
                projectLink: p.projectLink
            };
        });
    }

    // 5. TEK PROJE DETAYI
    async findOneProject(id: number) {
        const project = await this.prisma.projectAction.findUnique({
            where: { id },
            include: { client: true, payments: true }
        });

        if (!project) {
            throw new NotFoundException(`Proje ID ${id} bulunamadı`);
        }

        return {
            id: project.id,
            trackingCode: project.trackingCode,
            packageName: project.packageName,
            totalAmount: project.totalAmount,
            status: project.status,
            startDate: project.startDate,
            estimatedEndDate: project.estimatedEndDate,

            clientName: project.client.name,
            clientEmail: project.client.email,
            clientPhone: project.client.phone,

            companyName: project.companyName,
            businessType: project.businessType,
            businessScale: project.businessScale,

            payments: project.payments,
            projectLink: project.projectLink
        };
    }

    // 6. PROJE GÜNCELLEME (PATCH)
    async updateProject(id: number, data: any) {
        // Eğer projectLink gelmişse, URL başındaki localhost/IP'yi temizle
        let projectLink = data.projectLink;
        if (projectLink && typeof projectLink === 'string') {
            // http://localhost:3000/, http://127.0.0.1:3000/, vb başlangıçları kaldır
            projectLink = projectLink.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?\//, '');
        }

        return this.prisma.projectAction.update({
            where: { id },
            data: {
                totalAmount: data.totalAmount,
                projectLink: projectLink,
            },
        });
    }

    // 7. PROJE SİLME
    async deleteProject(id: number) {
        const deletePayments = this.prisma.payment.deleteMany({
            where: { projectActionId: id },
        });

        const deleteProject = this.prisma.projectAction.delete({
            where: { id },
        });

        await this.prisma.$transaction([deletePayments, deleteProject]);

        return { success: true, message: 'Silindi.' };
    }

    // --- DOĞRULAMA VE GÜVENLİK ---

    // 8. İLETİŞİM KONTROLÜ VE KOD GÖNDERME
    async checkContact(dto: { phone?: string; email?: string }) {
        let client: any = null;

        if (dto.phone) {
            client = await this.prisma.client.findFirst({ where: { phone: dto.phone } });
        } else if (dto.email) {
            client = await this.prisma.client.findUnique({ where: { email: dto.email } });
        }

        if (!client) {
            return { found: false };
        }

        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

        await this.prisma.client.update({
            where: { id: client.id },
            data: { otpCode: otp, otpExpiresAt: expiresAt }
        });

        if (dto.email) {
            await this.mailService.sendOtpEmail(client.email, otp);
        } else {
            console.log(`[SMS] Telefon: ${client.phone} - Kod: ${otp}`);
        }

        return {
            found: true,
            clientId: client.id,
            clientName: client.name
        };
    }

    // 9. KOD TEKRAR GÖNDERME
    async resendOtp(clientId: number, isEmail: boolean) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId }
        });

        if (!client) {
            return { success: false, message: 'Müşteri bulunamadı.' };
        }

        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

        // Eski kodu previousOtpCode'a taşı
        await this.prisma.client.update({
            where: { id: clientId },
            data: { 
                otpCode: otp, 
                otpExpiresAt: expiresAt,
                previousOtpCode: client.otpCode,
                previousOtpExpiresAt: client.otpExpiresAt
            }
        });

        if (isEmail) {
            await this.mailService.sendOtpEmail(client.email, otp);
        } else {
            console.log(`[SMS] Telefon: ${client.phone} - Kod: ${otp}`);
        }

        return {
            success: true,
            message: 'Kod tekrar gönderildi.'
        };
    }

    // 10. KOD DOĞRULAMA (Hem yeni hem eski kodu kontrol et)
    async verifyOtp(clientId: number, otp: string) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
            include: { projectActions: true }
        });

        if (!client) {
            return { success: false, message: 'Müşteri bulunamadı.' };
        }

        // Yeni kodu kontrol et
        let isValidCode = false;
        let isCurrentCode = false;

        // Mevcut kodu kontrol et
        if (client.otpCode === otp && client.otpExpiresAt && new Date() <= client.otpExpiresAt) {
            isValidCode = true;
            isCurrentCode = true;
        }
        // Eski kodu kontrol et
        else if (client.previousOtpCode === otp && client.previousOtpExpiresAt && new Date() <= client.previousOtpExpiresAt) {
            isValidCode = true;
            isCurrentCode = false;
        }

        if (!isValidCode) {
            return { success: false, message: 'Geçersiz kod.' };
        }

        // Başarılı - Kodları temizle
        await this.prisma.client.update({
            where: { id: clientId },
            data: { 
                otpCode: null, 
                otpExpiresAt: null,
                previousOtpCode: null,
                previousOtpExpiresAt: null
            }
        });

        const lastProject = client.projectActions[client.projectActions.length - 1];

        return {
            success: true,
            trackingCode: lastProject ? lastProject.trackingCode : null
        };
    }
}