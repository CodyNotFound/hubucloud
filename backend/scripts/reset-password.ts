#!/usr/bin/env bun

/**
 * 重设用户密码脚本
 * 用法: bun run scripts/reset-password.ts <username> <new_password>
 */

import { createHash } from 'crypto';

import { db } from '../src/utils/db';

async function resetPassword() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('用法: bun run scripts/reset-password.ts <username> <new_password>');
        console.error('示例: bun run scripts/reset-password.ts admin123 newpassword123');
        process.exit(1);
    }

    const [username, newPassword] = args;

    // 验证密码长度
    if (newPassword.length < 6) {
        console.error('❌ 错误: 新密码长度至少 6 个字符');
        process.exit(1);
    }

    try {
        // 查找用户
        const user = await db.user.findUnique({
            where: { user: username },
            select: {
                id: true,
                user: true,
                name: true,
                role: true,
            },
        });

        if (!user) {
            console.error(`❌ 错误: 用户 "${username}" 不存在`);
            process.exit(1);
        }

        // 加密新密码
        const hashedPassword = createHash('sha256').update(newPassword).digest('hex');

        // 更新密码
        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        console.log('✅ 密码重设成功!');
        console.log('📋 用户信息:');
        console.log(`   ID: ${user.id}`);
        console.log(`   用户名: ${user.user}`);
        console.log(`   姓名: ${user.name}`);
        console.log(`   角色: ${user.role}`);
        console.log('🔐 新密码已设置，用户可以使用新密码登录');
    } catch (error) {
        console.error('❌ 重设密码失败:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

resetPassword();
