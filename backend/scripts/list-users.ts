#!/usr/bin/env bun

/**
 * 列出所有用户脚本
 * 用法: bun run scripts/list-users.ts [role]
 * role: ALL (默认) | USER | ADMIN
 */

import { db } from '../src/utils/db';

async function listUsers() {
    const args = process.argv.slice(2);
    const roleFilter = args[0]?.toUpperCase() || 'ALL';

    if (!['ALL', 'USER', 'ADMIN'].includes(roleFilter)) {
        console.error('用法: bun run scripts/list-users.ts [role]');
        console.error('角色筛选: ALL (默认) | USER | ADMIN');
        console.error('示例: bun run scripts/list-users.ts ADMIN');
        process.exit(1);
    }

    try {
        // 构建查询条件
        const whereCondition = roleFilter === 'ALL' ? {} : { role: roleFilter as 'USER' | 'ADMIN' };

        // 获取用户列表
        const users = await db.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                user: true,
                name: true,
                role: true,
                phone: true,
                studentId: true,
                major: true,
                grade: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { role: 'desc' }, // ADMIN 排在前面
                { createdAt: 'asc' }, // 按创建时间排序
            ],
        });

        if (users.length === 0) {
            console.log(`📭 没有找到${roleFilter === 'ALL' ? '' : roleFilter}用户`);
            return;
        }

        // 统计信息
        const totalUsers = users.length;
        const adminUsers = users.filter((u) => u.role === 'ADMIN').length;
        const regularUsers = users.filter((u) => u.role === 'USER').length;

        console.log('👥 用户列表');
        console.log('='.repeat(80));
        console.log(
            `📊 总用户数: ${totalUsers} | 管理员: ${adminUsers} | 普通用户: ${regularUsers}`
        );

        if (roleFilter !== 'ALL') {
            console.log(`🔍 筛选: ${roleFilter === 'ADMIN' ? '仅显示管理员' : '仅显示普通用户'}`);
        }

        console.log('='.repeat(80));

        // 显示用户列表
        users.forEach((user, index) => {
            const roleIcon = user.role === 'ADMIN' ? '🔑' : '👤';
            const roleText = user.role === 'ADMIN' ? '管理员' : '普通用户';

            console.log(`${index + 1}. ${roleIcon} ${user.name} (${user.user})`);
            console.log(`   角色: ${roleText}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   电话: ${user.phone}`);
            console.log(`   学号: ${user.studentId}`);
            console.log(`   专业: ${user.major}`);
            console.log(`   年级: ${user.grade === -1 ? '未设置' : user.grade}`);
            console.log(`   创建: ${user.createdAt.toLocaleString('zh-CN')}`);
            console.log(`   更新: ${user.updatedAt.toLocaleString('zh-CN')}`);
            console.log('');
        });

        console.log('='.repeat(80));
        console.log('💡 提示:');
        console.log('   - 使用 bun run scripts/manage-role.ts <username> promote 提升为管理员');
        console.log('   - 使用 bun run scripts/manage-role.ts <username> demote 降级为普通用户');
        console.log('   - 使用 bun run scripts/reset-password.ts <username> <password> 重设密码');
    } catch (error) {
        console.error('❌ 获取用户列表失败:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

listUsers();
