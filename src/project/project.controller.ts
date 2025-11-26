import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Param,
    Get,
    Patch,
    Delete
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CheckContactDto } from './dto/check-contact.dto';
import { ApiKeyGuard } from '../auth/api-key/api-key.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    // 1. DURUM GÜNCELLEME (Yönetim Paneli - GİZLİ)
    @UseGuards(ApiKeyGuard) // Kilitli kalacak
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post(':projectId/status')
    async updateStatus(
        @Param('projectId') projectId: string,
        @Body() updateStatusDto: UpdateStatusDto,
    ) {
        const id = parseInt(projectId, 10);
        return this.projectService.updateProjectStatus(id, updateStatusDto);
    }

    // 2. PROJE OLUŞTURMA (Teklif Formu - ARTIK HERKESE AÇIK)
    // @UseGuards(ApiKeyGuard)  <-- BU SATIRI KALDIRDIK!
    // Artık müşteriler anahtarsız sipariş gönderebilir.
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post()
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        return this.projectService.createNewProject(createProjectDto);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() body: { clientId: number; otp: string }) {
        return this.projectService.verifyOtp(body.clientId, body.otp);
    }

    @Post('resend-otp')
    async resendOtp(@Body() body: { clientId: number; isEmail: boolean }) {
        return this.projectService.resendOtp(body.clientId, body.isEmail);
    }

    // YENİ METOT: İletişim Kontrolü (Public)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('check-contact')
    async checkContact(@Body() checkContactDto: CheckContactDto) {
        return this.projectService.checkContact(checkContactDto);
    }

    // 3. ÖDEME KAYDETME (Yönetim Paneli - GİZLİ)
    @UseGuards(ApiKeyGuard) // Kilitli kalacak
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('payments')
    async recordPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return this.projectService.recordPayment(createPaymentDto);
    }

    // 4. TÜM PROJELERİ LİSTELEME (Yönetim Paneli - GİZLİ)
    @UseGuards(ApiKeyGuard) // Kilitli kalacak
    @Get()
    async getAllProjects() {
        return this.projectService.findAllProjects();
    }

    // 5. TEK PROJE GETİRME (Detay Sayfası - GİZLİ)
    @UseGuards(ApiKeyGuard) // Kilitli kalacak
    @Get(':id')
    async getProjectById(@Param('id') id: string) {
        return this.projectService.findOneProject(parseInt(id, 10));
    }

    // 6. PROJE GÜNCELLEME (Fiyat/Link - GİZLİ)
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Patch(':id')
    async updateProject(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectService.updateProject(parseInt(id, 10), updateProjectDto);
    }

    // 7. SİLME (GİZLİ)
    @UseGuards(ApiKeyGuard)
    @Delete(':id')
    async deleteProject(@Param('id') id: string) {
        return this.projectService.deleteProject(parseInt(id, 10));
    }
}