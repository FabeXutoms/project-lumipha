import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CheckContactDto {
    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}