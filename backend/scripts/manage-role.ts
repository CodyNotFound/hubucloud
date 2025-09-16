#!/usr/bin/env bun

/**
 * 管理用户权限脚本
 * 用法: bun run scripts/manage-role.ts <username> <action>
 * action: promote (提升为管理员) | demote (降级为普通用户) | show (显示当前角色)
 */

import { db } from '../src/utils/db';

async function manageRole() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('用法: bun run scripts/manage-role.ts <username> <action>');
        console.error('操作:');
        console.error('  promote - 提升为管理员');
        console.error('  demote  - 降级为普通用户');
        console.error('  show    - 显示当前角色');
        console.error('示例: bun run scripts/manage-role.ts admin123 promote');
        process.exit(1);
    }

    const [username, action] = args;

    // 验证操作
    if (!['promote', 'demote', 'show'].includes(action)) {
        console.error('❌ 错误: 操作必须是 promote, demote 或 show');
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
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            console.error(`❌ 错误: 用户 "${username}" 不存在`);
            process.exit(1);
        }

        console.log('📋 当前用户信息:');
        console.log(`   ID: ${user.id}`);
        console.log(`   用户名: ${user.user}`);
        console.log(`   姓名: ${user.name}`);
        console.log(
            `   当前角色: ${user.role} ${user.role === 'ADMIN' ? '(管理员)' : '(普通用户)'}`
        );
        console.log(`   创建时间: ${user.createdAt}`);
        console.log(`   更新时间: ${user.updatedAt}`);
        console.log('');

        if (action === 'show') {
            console.log('ℹ️  角色信息已显示');
            return;
        }

        if (action === 'promote') {
            if (user.role === 'ADMIN') {
                console.log('⚠️  用户已经是管理员，无需提升');
                return;
            }

            await db.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' },
            });

            console.log('✅ 权限提升成功!');
            console.log(`🔑 用户 "${user.name}"(${user.user}) 已提升为管理员`);
            console.log('📝 用户现在可以访问管理后台');
        }

        if (action === 'demote') {
            if (user.role === 'USER') {
                console.log('⚠️  用户已经是普通用户，无需降级');
                return;
            }

            // 检查是否是最后一个管理员
            const adminCount = await db.user.count({
                where: { role: 'ADMIN' },
            });

            if (adminCount === 1) {
                console.error('❌ 错误: 不能降级最后一个管理员，系统至少需要一个管理员');
                process.exit(1);
            }

            await db.user.update({
                where: { id: user.id },
                data: { role: 'USER' },
            });

            console.log('✅ 权限降级成功!');
            console.log(`👤 用户 "${user.name}"(${user.user}) 已降级为普通用户`);
            console.log('📝 用户将无法访问管理后台');
        }

        // 显示系统管理员统计
        const finalAdminCount = await db.user.count({
            where: { role: 'ADMIN' },
        });

        console.log('');
        console.log(`📊 系统当前管理员数量: ${finalAdminCount}`);
    } catch (error) {
        console.error('❌ 管理权限失败:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

manageRole();
