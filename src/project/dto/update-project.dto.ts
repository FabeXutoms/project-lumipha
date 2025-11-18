// src/project/dto/update-project.dto.ts
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProjectDto {
  @IsOptional()
  @Transform(({ value }) => parseFloat(value)) // Gelen string'i sayıya çevir
  @IsNumber()
  @Min(0)
  totalAmount?: number;
}