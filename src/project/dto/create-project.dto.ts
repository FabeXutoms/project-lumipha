import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;   // <-- Eskiden burası 'name' kalmış olabilir

  @IsString()
  @IsNotEmpty()
  clientEmail: string;  // <-- Eskiden 'email' kalmış olabilir

  @IsString()
  @IsOptional()
  clientPhone?: string; // <-- Eskiden 'phone' kalmış olabilir

  @IsString()
  @IsNotEmpty()
  packageName: string;

  @IsNumber()
  @IsOptional()
  totalAmount: number;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  businessScale?: string;

  // Link alanı eklendi (Redirect için lazım)
  @IsString()
  @IsOptional()
  projectLink?: string;
}