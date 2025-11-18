// src/project/dto/update-status.dto.ts
import { IsString, IsIn, IsNotEmpty } from 'class-validator';

// Enum değerlerini doğrudan TypeScript'e giriyoruz
// (Veritabanındaki Türkçe map'lemeler ile uyumlu olmalı)
const validStatuses = ['WaitingForApproval', 'Pending', 'InProgress', 'Completed', 'Cancelled'];

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(validStatuses) // Sadece bu değerlere izin veriyoruz
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
}