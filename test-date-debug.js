
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();

    console.log('--- DB DATE DEBUG START ---');

    try {
        // 1. Create a dummy client
        const client = await prisma.client.create({
            data: {
                name: 'Debug User',
                email: 'debug@test.com',
                emailHash: 'debug_hash_' + Date.now(),
                phone: '123456',
                // phoneHash might be optional or needed, check logic
            }
        });

        // 2. Create a project with CURRENT timestamp
        const now = new Date();
        console.log('Javascript Date being inserted:', now.toISOString());

        const project = await prisma.projectAction.create({
            data: {
                clientId: client.id,
                trackingCode: 'DBG' + Math.floor(Math.random() * 10000),
                packageName: 'Debug Package',
                totalAmount: 100,
                startDate: now, // This should have Time component
                status: 'Pending'
            }
        });

        console.log('Project Created ID:', project.id);

        // 3. Fetch it back immediately
        const fetched = await prisma.projectAction.findUnique({
            where: { id: project.id }
        });

        console.log('Fetched startDate from DB:', fetched.startDate.toISOString());
        console.log('Fetched startDate from DB (Raw):', fetched.startDate);

        const isMidNight = fetched.startDate.toISOString().includes('T00:00:00.000Z');
        if (isMidNight) {
            console.error('FAIL: Time component was lost! DB is storing midnight.');
        } else {
            console.log('SUCCESS: Time component preserved.');
        }

        // Cleanup
        await prisma.projectAction.delete({ where: { id: project.id } });
        await prisma.client.delete({ where: { id: client.id } });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
        console.log('--- DB DATE DEBUG END ---');
    }
}

main();
