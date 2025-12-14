import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateContactMessageDto {
  @IsNotEmpty({ message: 'Ad ve soyad boş bırakılamaz.' })
  @IsString({ message: 'Ad ve soyad metin olmalıdır.' })
  @Matches(/^[a-zA-ZçÇğĞıİöÖşŞüÜ]+\s[a-zA-ZçÇğĞıİöÖşŞüÜ]+(\s[a-zA-ZçÇğĞıİöÖşŞüÜ]+)*$/, {
    message: 'Ad ve soyad boşluk ile ayrılmış, en az iki kelime olmalıdır. (Örn: Ali Yıldız)',
  })
  fullName: string;

  @IsNotEmpty({ message: 'Email adresi boş bırakılamaz.' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz. (@ve . işaretleri içermelidir)' })
  email: string;

  @IsNotEmpty({ message: 'Telefon numarası boş bırakılamaz.' })
  @IsString({ message: 'Telefon numarası metin olmalıdır.' })
  @Matches(/^\d{11}$/, {
    message: 'Telefon numarası tam olarak 11 rakamdan oluşmalıdır ve sadece sayı içermelidir.',
  })
  phone: string;

  @IsNotEmpty({ message: 'Mesaj boş bırakılamaz.' })
  @IsString({ message: 'Mesaj metin olmalıdır.' })
  @MinLength(25, { message: 'Mesaj en az 25 karakterden uzun olmalıdır.' })
  message: string;
}
