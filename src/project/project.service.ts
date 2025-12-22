import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Prisma } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MailService } from '../mail/mail.service';

import { EncryptionService } from '../common/encryption/encryption.service';

@Injectable()
export class ProjectService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private encryptionService: EncryptionService
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

    // 2. YENİ PROJE OLUŞTURMA (GÜVENLİ)
    async createNewProject(dto: CreateProjectDto) {
        console.log('--- Yeni Proje İsteği Başladı ---');
        // console.log('Gelen Veri:', { email: dto.clientEmail, phone: dto.clientPhone }); // GÜVENLİK: PII loglama kapatıldı

        // 1. Hash oluştur
        const emailHash = this.encryptionService.hash(dto.clientEmail);

        // KRİTİK DÜZELTME: Telefon boş string ("") gelirse onu null say, hashleme!
        const cleanPhone = (dto.clientPhone && dto.clientPhone.trim().length > 3) ? dto.clientPhone.trim() : null;
        const phoneHash = cleanPhone ? this.encryptionService.hash(cleanPhone) : null;

        // 2. Hash ile E-Posta Kontrolü
        const existingEmail = await this.prisma.client.findUnique({
            where: { emailHash: emailHash },
        });

        if (existingEmail) {
            console.error('ÇAKIŞMA: Bu e-posta zaten var! ID:', existingEmail.id);
            throw new ConflictException('Bu e-posta adresi zaten sistemde kayıtlı!');
        }

        // 3. Hash ile Telefon Kontrolü (Sadece telefon varsa bak)
        if (phoneHash) {
            const existingPhone = await this.prisma.client.findFirst({
                where: { phoneHash: phoneHash },
            });

            if (existingPhone) {
                console.error('ÇAKIŞMA: Bu telefon zaten var! ID:', existingPhone.id);
                throw new ConflictException('Bu telefon numarası zaten sistemde kayıtlı!');
            }
        }

        // 4. Verileri şifrele
        const encryptedEmail = this.encryptionService.encrypt(dto.clientEmail);
        const encryptedPhone = cleanPhone ? this.encryptionService.encrypt(cleanPhone) : null;

        console.log('Kontroller geçildi, kayıt başlıyor...');

        // 5. Transaction ile kayıt
        return await this.prisma.$transaction(async (prisma) => {
            const client = await prisma.client.create({
                data: {
                    name: dto.clientName,
                    email: encryptedEmail,      // Şifreli
                    emailHash: emailHash,       // Hash
                    phone: encryptedPhone,      // Şifreli
                    phoneHash: phoneHash,       // Hash (Varsa)
                },
            });

            const trackingCode = this.generateTrackingCode();
            const decimalAmount = new Prisma.Decimal(dto.totalAmount || 0);

            const newProject = await prisma.projectAction.create({
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

                    // Eğer link varsa ekle
                    projectLink: dto.projectLink || null
                },
            });

            console.log('Kayıt Başarılı. Yeni ID:', newProject.id);

            return {
                success: true,
                message: 'Proje ve Müşteri oluşturuldu.',
                trackingCode: newProject.trackingCode,
                projectId: newProject.id,
                clientId: client.id
            };
        });
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

            // Decrypt client info if needed
            let clientEmail = p.client.email;
            let clientPhone = p.client.phone;
            try {
                // Check if encrypted (contains IV separator)
                if (clientEmail.includes(':')) clientEmail = this.encryptionService.decrypt(clientEmail);
                if (clientPhone && clientPhone.includes(':')) clientPhone = this.encryptionService.decrypt(clientPhone);
            } catch (e) {
                // Ignore decryption error, might be legacy data
            }

            return {
                id: p.id,
                trackingCode: p.trackingCode,
                startDate: p.startDate,
                status: p.status,
                clientName: p.client.name,
                clientEmail: clientEmail,
                clientPhone: clientPhone,
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

        // Decrypt
        let clientEmail = project.client.email;
        let clientPhone = project.client.phone;
        try {
            if (clientEmail.includes(':')) clientEmail = this.encryptionService.decrypt(clientEmail);
            if (clientPhone && clientPhone.includes(':')) clientPhone = this.encryptionService.decrypt(clientPhone);
        } catch (e) { }

        return {
            id: project.id,
            trackingCode: project.trackingCode,
            packageName: project.packageName,
            totalAmount: project.totalAmount,
            status: project.status,
            startDate: project.startDate,
            estimatedEndDate: project.estimatedEndDate,

            clientName: project.client.name,
            clientEmail: clientEmail,
            clientPhone: clientPhone,

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
            // Basit bir temizlik ve doğrulama
            projectLink = projectLink.trim();
            // XSS ve kötü amaçlı karakterleri engelle (Basit kontrol)
            if (projectLink.includes('<') || projectLink.includes('>') || projectLink.includes('javascript:')) {
                throw new ConflictException('Güvensiz link tespiti.');
            }

            // http://localhost:3000/, http://127.0.0.1:3000/, vb başlangıçları kaldır
            projectLink = projectLink.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?\//, '');
        }

        // Update data'sını dinamik olarak oluştur
        const updateData: any = {
            projectLink: projectLink,
        };

        // TotalAmount varsa Decimal'e çevir ve ekle
        if (data.totalAmount !== undefined) {
            updateData.totalAmount = new Prisma.Decimal(data.totalAmount);
        }

        return this.prisma.projectAction.update({
            where: { id },
            data: updateData,
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
            const phoneHash = this.encryptionService.hash(dto.phone);
            client = await this.prisma.client.findFirst({ where: { phoneHash: phoneHash } });
        } else if (dto.email) {
            const emailHash = this.encryptionService.hash(dto.email);
            client = await this.prisma.client.findUnique({ where: { emailHash: emailHash } });
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
            // Decrypt email before sending? Or just use dto.email which is plain text
            // Using dto.email is safer/faster since we have it.
            await this.mailService.sendOtpEmail(dto.email, otp);
        } else {
            // console.log(`[SMS] Telefon: ${dto.phone} - Kod: ${otp}`); // GÜVENLİK: OTP loglama kapatıldı
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
            // Decrypt email for sending
            let email = client.email;
            try { if (email.includes(':')) email = this.encryptionService.decrypt(email); } catch (e) { }
            await this.mailService.sendOtpEmail(email, otp);
        } else {
            let phone = client.phone;
            try { if (phone && phone.includes(':')) phone = this.encryptionService.decrypt(phone); } catch (e) { }
            // console.log(`[SMS] Telefon: ${phone} - Kod: ${otp}`); // GÜVENLİK: OTP loglama kapatıldı
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