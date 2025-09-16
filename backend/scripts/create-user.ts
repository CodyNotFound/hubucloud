#!/usr/bin/env bun

/**
 * 创建用户脚本
 * 用法: bun run scripts/create-user.ts <username> <password> [role]
 */

import { createHash } from 'crypto';

import { db } from '../src/utils/db';

async function createUser() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('用法: bun run scripts/create-user.ts <username> <password> [role]');
        console.error('示例: bun run scripts/create-user.ts admin123 password123 ADMIN');
        console.error('角色: USER (默认) 或 ADMIN');
        process.exit(1);
    }

    const [username, password, role = 'USER'] = args;

    // 验证角色
    if (role !== 'USER' && role !== 'ADMIN') {
        console.error('❌ 错误: 角色必须是 USER 或 ADMIN');
        process.exit(1);
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 30) {
        console.error('❌ 错误: 用户名长度必须在 3-30 个字符之间');
        process.exit(1);
    }

    // 验证密码长度
    if (password.length < 6) {
        console.error('❌ 错误: 密码长度至少 6 个字符');
        process.exit(1);
    }

    try {
        // 检查用户名是否已存在
        const existingUser = await db.user.findUnique({
            where: { user: username },
        });

        if (existingUser) {
            console.error(`❌ 错误: 用户名 "${username}" 已存在`);
            process.exit(1);
        }

        // 密码加密
        const hashedPassword = createHash('sha256').update(password).digest('hex');

        // 创建用户
        const newUser = await db.user.create({
            data: {
                user: username,
                password: hashedPassword,
                name: username, // 默认使用用户名作为姓名
                avatar: '/logo.png',
                phone: '未设置',
                studentId: `temp_${Date.now()}`,
                major: '未设置',
                grade: -1,
                role: role as 'USER' | 'ADMIN',
            },
            select: {
                id: true,
                user: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        console.log('✅ 用户创建成功!');
        console.log('📋 用户信息:');
        console.log(`   ID: ${newUser.id}`);
        console.log(`   用户名: ${newUser.user}`);
        console.log(`   姓名: ${newUser.name}`);
        console.log(`   角色: ${newUser.role}`);
        console.log(`   创建时间: ${newUser.createdAt}`);

        if (role === 'ADMIN') {
            console.log('🔑 管理员用户创建成功，可以访问管理后台');
        }
    } catch (error) {
        console.error('❌ 创建用户失败:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

createUser();
