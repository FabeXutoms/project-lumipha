// src/project/dto/update-project.dto.ts
import { IsNumber, IsOptional, Min, IsString } from 'class-validator'; // IsString'i ekle
import { Transform } from 'class-transformer';

export class UpdateProjectDto {
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  // YENİ ALAN
  @IsOptional()
  @IsString()
  projectLink?: string;
}