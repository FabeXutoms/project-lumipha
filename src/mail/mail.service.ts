// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Veya host: 'smtp.example.com'
            auth: {
                user: process.env.MAIL_USER, // .env dosyasından alacak
                pass: process.env.MAIL_PASS, // .env dosyasından alacak
            },
        });
    }

    async sendOtpEmail(to: string, code: string) {
        const mailOptions = {
            from: '"Lumipha Ajans" <noreply@lumipha.com>',
            to: to,
            subject: 'Sipariş Doğrulama Kodunuz',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Merhaba!</h2>
            <p>Sipariş takip sistemine giriş yapmak için doğrulama kodunuz:</p>
            <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
            <p>Bu kod 5 dakika süreyle geçerlidir.</p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            // console.log(`E-posta gönderildi: ${to}`); // GÜVENLİK: PII kapatıldı
            return true;
        } catch (error) {
            console.error('E-posta gönderme hatası:', error);
            return false;
        }
    }

    async sendContactEmail(to: string, subject: string, html: string) {
        const mailOptions = {
            from: '"Lumipha Ajans" <noreply@lumipha.com>',
            to: to,
            subject: subject,
            html: html,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            // console.log(`İletişim e-postası gönderildi: ${to}`); // GÜVENLİK: PII kapatıldı
            return true;
        } catch (error) {
            console.error('İletişim e-postası gönderme hatası:', error);
            return false;
        }
    }
}