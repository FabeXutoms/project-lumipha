// src/project/project.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Prisma } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
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
        const existingEmail = await this.prisma.client.findUnique({
            where: { email: dto.clientEmail },
        });
        if (existingEmail) {
            throw new ConflictException('Bu e-posta adresi zaten sistemde kayıtlı! Lütfen farklı bir e-posta kullanın.');
        }

        if (dto.clientPhone) {
            const existingPhone = await this.prisma.client.findFirst({
                where: { phone: dto.clientPhone },
            });
            if (existingPhone) {
                throw new ConflictException('Bu telefon numarası zaten sistemde kayıtlı! Lütfen farklı bir numara kullanın.');
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
        const decimalAmount = new Prisma.Decimal(dto.totalAmount);

        const newProject = await this.prisma.projectAction.create({
            data: {
                clientId: client.id,
                trackingCode: trackingCode,
                packageName: dto.packageName,
                totalAmount: decimalAmount,
                startDate: new Date(),
                status: 'Pending',
            },
        });

        return {
            success: true,
            message: 'Proje ve Müşteri başarıyla oluşturuldu.',
            trackingCode: newProject.trackingCode,
            projectId: newProject.id,
            clientId: client.id,
            clientName: client.name
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

        await this.prisma.projectAction.update({
            where: { id: dto.projectId },
            data: { status: 'InProgress' },
        });

        return {
            success: true,
            message: 'Ödeme başarıyla kaydedildi.',
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
                projectLink: true,
                payments: {
                    select: { amount: true }
                },
                client: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
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
                clientEmail: p.client.email,
                clientPhone: p.client.phone,
                isPaid: totalPaid >= amount && amount > 0,
                totalAmount: amount,
                projectLink: p.projectLink
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
            payments: project.payments,
            projectLink: project.projectLink
        };
    }

    // 6. PROJE GÜNCELLEME
    async updateProject(id: number, data: any) {
        return this.prisma.projectAction.update({
            where: { id },
            data: {
                totalAmount: data.totalAmount,
                projectLink: data.projectLink,
            },
        });
    }

    // 7. SİLME METODU (Sınıfın içine eklendi)
    async deleteProject(id: number) {
        const deletePayments = this.prisma.payment.deleteMany({
            where: { projectActionId: id },
        });

        const deleteProject = this.prisma.projectAction.delete({
            where: { id },
        });

        await this.prisma.$transaction([deletePayments, deleteProject]);

        return {
            success: true,
            message: `Proje ${id} ve tüm ödeme kayıtları kalıcı olarak silindi.`
        };
    }

} // <--- SINIF BURADA KAPANIYOR