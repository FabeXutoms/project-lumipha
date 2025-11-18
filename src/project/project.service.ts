// src/project/project.service.ts - TAM VE DÜZELTİLMİŞ VERSİYON

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Prisma } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
// UpdateProjectDto dosyasını oluşturmadıysan bu satırı sil veya yorum satırı yap, 
// ama PATCH işlemi için gereklidir.
import { UpdateProjectDto } from './dto/update-project.dto'; 

@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) { }

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
                message: `Project ${projectId} status updated to ${dto.status}.`,
                projectId: updatedProject.id,
                newStatus: updatedProject.status,
            };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Project with ID ${projectId} not found.`);
            }
            throw error;
        }
    }

    // Yardımcı Fonksiyon
    private generateTrackingCode(): string {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const datePart = new Date().getFullYear().toString().substring(2);
        return `AJ${datePart}${randomPart}`;
    }

    // 2. YENİ PROJE OLUŞTURMA
    async createNewProject(dto: CreateProjectDto) {
        const client = await this.prisma.client.upsert({
            where: { email: dto.clientEmail },
            update: { name: dto.clientName, phone: dto.clientPhone },
            create: {
                name: dto.clientName,
                email: dto.clientEmail,
                phone: dto.clientPhone,
            },
        });

        const trackingCode = this.generateTrackingCode();
        
        // Prisma Decimal dönüşümü
        const decimalAmount = new Prisma.Decimal(dto.totalAmount);

        const newProject = await this.prisma.projectAction.create({
            data: {
                clientId: client.id,
                trackingCode: trackingCode,
                packageName: dto.packageName,
                totalAmount: decimalAmount,
                startDate: new Date(),
                status: 'WaitingForApproval', // Varsayılan durum
            },
        });

        return {
            success: true,
            message: 'Project and Client created successfully.',
            trackingCode: newProject.trackingCode,
            projectId: newProject.id,
            clientId: client.id,
        };
    }

    // 3. ÖDEME KAYDETME
    async recordPayment(dto: CreatePaymentDto) {
        const existingPayment = await this.prisma.payment.findUnique({
            where: { transactionId: dto.transactionId },
        });

        if (existingPayment) {
            throw new ConflictException('Bu işlem ID\'si ile daha önce ödeme kaydedilmiştir.');
        }

        const payment = await this.prisma.payment.create({
            data: {
                projectActionId: dto.projectId,
                amount: new Prisma.Decimal(dto.amount),
                paymentMethod: dto.paymentMethod,
                transactionId: dto.transactionId,
            },
        });

        // Ödeme yapıldı, durumu InProgress (İşlemde) yapalım
        await this.prisma.projectAction.update({
            where: { id: dto.projectId },
            data: { status: 'InProgress' },
        });

        return {
            success: true,
            message: 'Ödeme başarıyla kaydedildi ve proje durumu güncellendi.',
            paymentId: payment.id,
            projectId: payment.projectActionId,
            projectStatus: 'InProgress',
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
                payments: {
                    select: { amount: true }
                },
                client: {
                    select: {
                        name: true,
                    }
                }
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
                // Toplam tutar ile ödenen tutarı karşılaştır
                isPaid: totalPaid >= amount && amount > 0
            };
        });
    }

    // 5. TEK PROJE DETAYI GETİRME
    async findOneProject(id: number) {
        const project = await this.prisma.projectAction.findUnique({
            where: { id },
            include: {
                client: true,
                payments: true
            }
        });

        if (!project) {
            throw new NotFoundException(`Project ID ${id} not found`);
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
            payments: project.payments
        };
    }

    // 6. PROJE GÜNCELLEME (FİYAT VB.) - PATCH
    async updateProject(id: number, data: any) { 
        return this.prisma.projectAction.update({
            where: { id },
            data: {
                totalAmount: data.totalAmount,
            },
        });
    }

} // <--- SINIF BURADA KAPANIYOR (TS1128 Hatasının Çözümü)