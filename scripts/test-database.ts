#!/usr/bin/env bun

/**
 * 测试数据库连接和数据
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 测试数据库连接...');

    try {
        // 测试连接
        await prisma.$connect();
        console.log('✅ 数据库连接成功');

        // 查询餐厅数量
        const count = await prisma.restaurant.count();
        console.log(`📊 餐厅总数: ${count}`);

        // 查询前5个餐厅
        const restaurants = await prisma.restaurant.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                type: true,
                address: true,
            }
        });

        console.log('📝 前5个餐厅:');
        restaurants.forEach((restaurant, index) => {
            console.log(`  ${index + 1}. ${restaurant.name} (${restaurant.type}) - ${restaurant.address}`);
        });

        // 统计各类型数量
        const typeCounts = await prisma.restaurant.groupBy({
            by: ['type'],
            _count: {
                type: true
            }
        });

        console.log('📈 类型统计:');
        typeCounts.forEach(item => {
            console.log(`  ${item.type}: ${item._count.type} 个`);
        });

    } catch (error) {
        console.error('💥 数据库操作失败:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);