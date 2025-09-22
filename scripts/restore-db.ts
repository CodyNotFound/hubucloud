#!/usr/bin/env bun
import { readFileSync, existsSync } from 'fs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const [filename] = process.argv.slice(2);

    if (!filename) {
        console.log('用法: bun scripts/restore-db.ts <备份文件名>');
        console.log('示例: bun scripts/restore-db.ts backup_2025-01-19.json');
        process.exit(1);
    }

    if (!existsSync(filename)) {
        console.error(`❌ 文件不存在: ${filename}`);
        process.exit(1);
    }

    try {
        console.log(`📥 开始导入数据库: ${filename}`);

        const fileContent = readFileSync(filename, 'utf-8');
        const data = JSON.parse(fileContent);

        // 清空现有数据
        console.log('🗑️  清空现有数据...');
        await prisma.parttime.deleteMany();
        await prisma.restaurant.deleteMany();
        await prisma.user.deleteMany();

        // 导入数据
        if (data.users?.length > 0) {
            console.log(`👥 导入用户: ${data.users.length} 个`);
            await prisma.user.createMany({ data: data.users });
        }

        if (data.restaurants?.length > 0) {
            console.log(`🍽️  导入餐厅: ${data.restaurants.length} 个`);
            await prisma.restaurant.createMany({ data: data.restaurants });
        }

        if (data.parttimes?.length > 0) {
            console.log(`💼 导入兼职: ${data.parttimes.length} 个`);
            await prisma.parttime.createMany({ data: data.parttimes });
        }

        console.log('✅ 数据库恢复完成');
        console.log(`   备份时间: ${data.backupTime || '未知'}`);
    } catch (error: any) {
        console.error('❌ 导入失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
