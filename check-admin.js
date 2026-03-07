const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Checking DB...");
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    console.log("Admin record:", admin);
    if (admin) {
        const isValid = await bcrypt.compare('adminpassword123', admin.password_hash);
        console.log("Is 'adminpassword123' valid for this hash?", isValid);
    }
}

main().finally(() => prisma.$disconnect());
