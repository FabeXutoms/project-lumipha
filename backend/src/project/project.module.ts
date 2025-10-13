// src/project/project.module.ts
import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Prisma'yı import et

@Module({
  imports: [PrismaModule], // Buraya ekle
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}