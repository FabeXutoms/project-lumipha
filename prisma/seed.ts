import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const admins = [
        { name: 'Emirhan', password: 'emirhan' },
        { name: 'Yavuz', password: 'yavuz' },
        { name: 'Furkan', password: 'furkan' },
    ];

    for (const admin of admins) {
        console.log(`🚀 ${admin.name} kullanıcısı işleniyor...`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(admin.password, salt);

        // upsert komutu: Varsa güncelle (update), yoksa oluştur (create)
        // Not: 'name' alanının şemada @unique olması gerekir. 
        // Eğer unique değilse 'updateMany' kullanacağız.

        await prisma.admin.updateMany({
            where: { name: admin.name },
            data: { passwordHash: hash }
        });

        // Eğer hiç yoksa oluşturması için:
        const check = await prisma.admin.findFirst({ where: { name: admin.name } });
        if (!check) {
            await prisma.admin.create({
                data: { name: admin.name, passwordHash: hash }
            });
            console.log(`✅ ${admin.name} yeni oluşturuldu.`);
        } else {
            console.log(`✅ ${admin.name} şifresi güncellendi.`);
        }
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });