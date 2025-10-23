#!/usr/bin/env bun

/**
 * 修复餐厅封面脚本
 * 对于没有封面的餐厅，如果有preview图片则设置第一张为封面，否则设为logo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRestaurantCovers() {
    console.log('开始修复餐厅封面...');

    try {
        // 获取所有餐厅
        const restaurants = await prisma.restaurant.findMany({
            select: {
                id: true,
                name: true,
                cover: true,
                preview: true,
            },
        });

        console.log(`找到 ${restaurants.length} 个餐厅`);

        let fixedCount = 0;
        const updates = [];

        for (const restaurant of restaurants) {
            let newCover = restaurant.cover;
            let needsUpdate = false;

            // 检查是否需要修复封面
            if (!restaurant.cover || restaurant.cover.trim() === '') {
                // 没有封面，需要设置
                if (restaurant.preview && restaurant.preview.length > 0) {
                    // 有预览图片，使用第一张作为封面
                    newCover = restaurant.preview[0];
                } else {
                    // 没有预览图片，使用logo
                    newCover = '/logo.png';
                }
                needsUpdate = true;
            }

            if (needsUpdate) {
                updates.push({
                    id: restaurant.id,
                    name: restaurant.name,
                    oldCover: restaurant.cover || '(空)',
                    newCover,
                });

                console.log(`准备更新餐厅: ${restaurant.name}`);
                console.log(`  原封面: ${restaurant.cover || '(空)'}`);
                console.log(`  新封面: ${newCover}`);
                console.log(`  预览图片数量: ${restaurant.preview?.length || 0}`);

                fixedCount++;
            }
        }

        if (updates.length === 0) {
            console.log('所有餐厅的封面都已正确设置，无需修复');
            return;
        }

        console.log(`\n准备更新 ${updates.length} 个餐厅的封面...`);

        // 执行批量更新
        for (const update of updates) {
            await prisma.restaurant.update({
                where: { id: update.id },
                data: { cover: update.newCover },
            });
            console.log(`✓ 已更新餐厅 "${update.name}" 的封面`);
        }

        console.log(`\n✅ 成功修复了 ${fixedCount} 个餐厅的封面`);

        // 显示修复统计
        const logoCoverCount = updates.filter((u) => u.newCover === '/logo.png').length;
        const imageCoverCount = updates.filter((u) => u.newCover !== '/logo.png').length;

        console.log('\n修复统计:');
        console.log(`  设置为logo封面: ${logoCoverCount} 个`);
        console.log(`  设置为预览图片封面: ${imageCoverCount} 个`);
    } catch (error) {
        console.error('修复餐厅封面时发生错误:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// 运行脚本
async function main() {
    try {
        await fixRestaurantCovers();
        console.log('\n脚本执行完成');
    } catch (error) {
        console.error('脚本执行失败:', error);
        process.exit(1);
    }
}

main();
