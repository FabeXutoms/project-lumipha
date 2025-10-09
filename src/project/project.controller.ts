// src/project/project.controller.ts
import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Param // <-- Burası DİKKAT!
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateStatusDto } from './dto/update-status.dto'; 
import { ApiKeyGuard } from '../auth/api-key/api-key.guard';  // ApiKeyGuard import'u

@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    // --- Burası ÖNEMLİ: Tüm dekoratörler, metodun hemen üstünde, sınıf içinde olmalı. ---


    @UseGuards(ApiKeyGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post(':projectId/status') // PUT yerine şimdilik POST kullanıyoruz, Postman'de test kolaylığı için
    async updateStatus(
        @Param('projectId') projectId: string, // URL'den ID'yi alıyoruz
        @Body() updateStatusDto: UpdateStatusDto, // Gövdeden durumu alıyoruz
    ) {
        // URL'den gelen ID string olduğu için sayıya çeviriyoruz
        const id = parseInt(projectId, 10);

        return this.projectService.updateProjectStatus(id, updateStatusDto);
    }

    // POST isteği için rota belirleme
    @Post()
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        return this.projectService.createNewProject(createProjectDto);
    }
}