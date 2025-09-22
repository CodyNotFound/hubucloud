#!/usr/bin/env bun
import * as crypto from 'crypto';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
    const [username, newPassword] = process.argv.slice(2);

    if (!username || !newPassword) {
        console.log('用法: bun scripts/reset-password.ts <用户名> <新密码>');
        process.exit(1);
    }

    try {
        const hashedPassword = hashPassword(newPassword);

        await prisma.user.update({
            where: { user: username },
            data: { password: hashedPassword },
        });

        console.log(`✅ 用户 ${username} 密码重置成功`);
    } catch (error: any) {
        console.error('❌ 重置失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
