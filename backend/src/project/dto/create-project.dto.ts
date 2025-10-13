// src/project/dto/create-project.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProjectDto {
  // MÜŞTERİ BİLGİLERİ
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;

  @IsString()
  @IsOptional() // Telefon isteğe bağlı
  clientPhone?: string;

  // PROJE BİLGİLERİ
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalAmount: number; // JavaScript'te sayılar 'number' tipinde kullanılır
}