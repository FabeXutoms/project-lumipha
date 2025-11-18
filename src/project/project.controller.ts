// src/project/project.controller.ts

import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Param,
    // ConflictException'ı serviste kullandık, burada kullanmıyorsak silinebilir
    // ConflictException,
    Get // <-- TÜM GET İŞLEMLERİ İÇİN BU IMPORT GEREKLİ!
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiKeyGuard } from '../auth/api-key/api-key.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Patch } from '@nestjs/common'; // <-- EN TEPEYE Patch'i ekle
import { UpdateProjectDto } from './dto/update-project.dto'; // <-- Import et

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    // 1. Durum Güncelleme Metodu (POST /projects/:id/status)
    // Güvenlik ve Doğrulama Gerekli
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post(':projectId/status')
    async updateStatus(
        @Param('projectId') projectId: string,
        @Body() updateStatusDto: UpdateStatusDto,
    ) {
        const id = parseInt(projectId, 10);
        return this.projectService.updateProjectStatus(id, updateStatusDto);
    }

    // 2. Proje Oluşturma Metodu (POST /projects)
    // Güvenlik ve Doğrulama Gerekli
    @UseGuards(ApiKeyGuard) // <-- Eksik olan Güvenlik eklendi!
    @UsePipes(new ValidationPipe({ transform: true })) // <-- Eksik olan Doğrulama eklendi!
    @Post()
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        return this.projectService.createNewProject(createProjectDto);
    }

    // 3. Ödeme Kaydetme Metodu (POST /projects/payments)
    // Güvenlik ve Doğrulama Gerekli (Metot doğru konuma taşındı)
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('payments')
    async recordPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return this.projectService.recordPayment(createPaymentDto);
    }

    // 4. Tüm Projeleri Listeleme Metodu (GET /projects)
    // Güvenlik Gerekli (Metot doğru konuma taşındı)
    @UseGuards(ApiKeyGuard)
    @Get()
    async getAllProjects() {
        return this.projectService.findAllProjects();
    }

    // TEK PROJE GETİRME (Detay Sayfası İçin)
    @UseGuards(ApiKeyGuard)
    @Get(':id') // GET /projects/1
    async getProjectById(@Param('id') id: string) {
        return this.projectService.findOneProject(parseInt(id, 10));
    }

    @UseGuards(ApiKeyGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Patch(':id')
    async updateProject(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectService.updateProject(parseInt(id, 10), updateProjectDto);
    }
}