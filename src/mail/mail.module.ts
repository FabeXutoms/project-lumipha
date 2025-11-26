// src/mail/mail.module.ts
import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // Her yerden erişilsin diye Global yapıyoruz
@Module({
  providers: [MailService],
  exports: [MailService], // <-- Dışarı aktarmayı unutma
})
export class MailModule { }