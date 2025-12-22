import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Şifreleri buradan istediğin gibi güncelle dayı
    const admins = [
        { name: 'Emirhan', password: '153153123' },
        { name: 'Yavuz', password: '153153122' },
        { name: 'Furkan', password: '153153111' },
    ];

    for (const admin of admins) {
        // İsme göre kontrol et
        const existing = await prisma.admin.findFirst({
            where: { name: admin.name }
        });

        if (!existing) {
            console.log(`🚀 Yeni admin ekleniyor: ${admin.name}`);
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(admin.password, salt);

            await prisma.admin.create({
                data: {
                    name: admin.name,
                    passwordHash: hash, // Şemadaki kolon adın bu, doğru.
                },
            });
        } else {
            console.log(`✅ Admin ${admin.name} zaten veritabanında var. Güncellenmedi.`);
        }
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });