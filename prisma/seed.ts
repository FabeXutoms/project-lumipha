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
        // findUnique yerine findFirst kullanıyoruz (Daha güvenli)
        const existing = await prisma.admin.findFirst({
            where: { name: admin.name }
        });

        if (!existing) {
            console.log(`🚀 Admin ekleniyor: ${admin.name}`);
            const hash = await bcrypt.hash(admin.password, 10);
            await prisma.admin.create({
                data: {
                    name: admin.name,
                    passwordHash: hash, // Şemandaki isim buydu
                },
            });
        } else {
            console.log(`✅ ${admin.name} zaten var, pas geçiliyor.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });