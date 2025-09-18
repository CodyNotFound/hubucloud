#!/usr/bin/env bun

/**
 * 清理餐厅数据并推送新的 schema
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 开始清理餐厅数据...');

    try {
        // 清理所有餐厅数据
        const deletedCount = await prisma.restaurant.deleteMany({});
        console.log(`✅ 已清理 ${deletedCount.count} 条餐厅数据`);

        console.log('🎉 数据清理完成！现在可以推送 schema 了');
        console.log('请运行: DATABASE_URL="postgresql://root:123456@localhost:5432/postgres" bunx prisma db push');

    } catch (error) {
        console.error('💥 清理数据时发生错误:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);