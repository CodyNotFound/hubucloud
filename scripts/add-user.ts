#!/usr/bin/env bun
import * as crypto from 'crypto';

import { PrismaClient, Role } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
    const [username, password, role] = process.argv.slice(2);

    if (!username || !password) {
        console.log('用法: bun scripts/add-user.ts <用户名> <密码> [admin]');
        process.exit(1);
    }

    try {
        const userRole = role === 'admin' ? Role.ADMIN : Role.USER;
        const hashedPassword = hashPassword(password);

        const user = await prisma.user.create({
            data: {
                id: createId(),
                user: username,
                password: hashedPassword,
                role: userRole,
                name: username,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                phone: '未设置',
                studentId: createId(),
                major: '未设置',
                grade: 2024,
            },
        });

        console.log(`✅ 用户 ${user.user} 创建成功 (${user.role})`);
    } catch (error: any) {
        console.error('❌ 创建失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
