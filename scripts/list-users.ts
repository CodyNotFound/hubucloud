#!/usr/bin/env bun
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                user: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log('用户列表:');
        console.log('─'.repeat(40));
        users.forEach((user) => {
            console.log(
                `${user.user.padEnd(15)} ${user.role.padEnd(8)} ${user.createdAt.toLocaleDateString()}`
            );
        });
        console.log(`─`.repeat(40));
        console.log(`总计: ${users.length} 个用户`);
    } catch (error: any) {
        console.error('❌ 获取用户失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
