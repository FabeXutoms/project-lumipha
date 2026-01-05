// src/project/dto/create-payment.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePaymentDto {
  // Ödeme hangi projeye ait?
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  projectId: number; 

  // Ödenen miktar
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  // Ödeme yöntemi (Havale, Kredi Kartı, vb.)
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  // Ödeme sağlayıcısından gelen benzersiz işlem ID'si (Tekrarlanan ödemeyi engeller)
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}