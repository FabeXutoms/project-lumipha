import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const admins = [
        { name: 'Emirhan', password: 'emirhanPass123' },
        { name: 'Yavuz', password: 'yavuzPass123' },
        { name: 'Furkan', password: 'furkanPass123' },
    ];

    for (const admin of admins) {
        const existing = await prisma.admin.findUnique({ where: { name: admin.name } });
        if (!existing) {
            console.log(`Seeding admin: ${admin.name}`);
            const hash = await bcrypt.hash(admin.password, 10);
            await prisma.admin.create({
                data: {
                    name: admin.name,
                    passwordHash: hash,
                },
            });
        } else {
            console.log(`Admin ${admin.name} already exists. Skipping.`);
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
