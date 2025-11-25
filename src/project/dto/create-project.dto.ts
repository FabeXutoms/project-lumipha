import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString() @IsNotEmpty() clientName: string;
  @IsString() @IsNotEmpty() clientEmail: string;
  @IsString() @IsOptional() clientPhone?: string;
  @IsString() @IsNotEmpty() packageName: string;
  @IsNumber() @IsOptional() totalAmount: number; // Teklif formunda fiyat belli değil, 0 gidecek

  // YENİ ALANLAR
  @IsString() @IsOptional() companyName?: string;
  @IsString() @IsOptional() businessType?: string;
  @IsString() @IsOptional() businessScale?: string;
}