// src/project/project.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'; 
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Prisma } from '@prisma/client';
import { UpdateStatusDto } from './dto/update-status.dto'; 

@Injectable()
export class ProjectService {
    constructor(private prisma: PrismaService) { }

    async updateProjectStatus(projectId: number, dto: UpdateStatusDto) {
        try {
            // Prisma'da update metodu ile güncelleme yapıyoruz
            const updatedProject = await this.prisma.projectAction.update({
                where: { id: projectId },
                data: {
                    status: dto.status, // Gelen yeni durumu kullan
                    // Eğer tamamlandıysa, bitiş tarihini de şimdi olarak ayarla
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
            // Eğer verilen ID'ye sahip bir proje yoksa hata fırlat
            if (error.code === 'P2025') {
                throw new NotFoundException(`Project with ID ${projectId} not found.`);
            }
            throw error;
        }
    }

    // Benzersiz bir takip kodu oluşturma yardımcı fonksiyonu
    private generateTrackingCode(): string {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const datePart = new Date().getFullYear().toString().substring(2);
        return `AJ${datePart}${randomPart}`; // Örn: AJ25W7X4Y
    }

    async createNewProject(dto: CreateProjectDto) {
        // 1. İşlem: Yeni müşteri kaydını kontrol et veya oluştur
        const client = await this.prisma.client.upsert({
            // ... client upsert mantığı aynı kalır ...
            where: { email: dto.clientEmail },
            update: { name: dto.clientName, phone: dto.clientPhone },
            create: {
                name: dto.clientName,
                email: dto.clientEmail,
                phone: dto.clientPhone,
            },
        });

        // 2. İşlem: Yeni Proje Hareketini oluştur
        const trackingCode = this.generateTrackingCode();

        const newProject = await this.prisma.projectAction.create({
            data: {
                clientId: client.id, // Yeni/Mevcut müşteri ID'sini kullan
                trackingCode: trackingCode,
                packageName: dto.packageName,
                totalAmount: dto.totalAmount,
                startDate: new Date(), // Projenin başladığı tarih (Şimdi)
                // estimatedEndDate ve Status (Pending) varsayılan olarak kalacak
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
}
