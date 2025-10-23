#!/usr/bin/env bun
import { readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 从各种 URL 中提取图片文件名
 * 支持格式：
 * - /api/images/xxx.webp (主要格式)
 * - /uploads/images/xxx.jpg (旧格式)
 * - https://example.com/api/images/xxx.webp
 */
function extractImageFilename(url: string): string | null {
    if (!url) return null;

    // 跳过外部 URL (如 dicebear.com)
    if (
        url.startsWith('http') &&
        !url.includes('/api/images/') &&
        !url.includes('/uploads/images/')
    ) {
        return null;
    }

    // 匹配 /api/images/xxx.ext 或 /uploads/images/xxx.ext
    const match = url.match(/\/(?:api|uploads)\/images\/([^?]+)/);

    return match ? match[1] : null;
}

/**
 * 收集所有数据库中使用的图片文件名
 */
async function collectUsedImages(): Promise<Set<string>> {
    const imageSet = new Set<string>();

    console.log('📊 正在扫描数据库中使用的图片...\n');

    // 1. 用户头像
    const users = await prisma.user.findMany({ select: { avatar: true } });
    let userImageCount = 0;

    for (const user of users) {
        const filename = extractImageFilename(user.avatar);

        if (filename) {
            imageSet.add(filename);
            userImageCount++;
        }
    }

    console.log(`   ✓ 用户头像: ${userImageCount} 张`);

    // 2. 餐厅相关图片
    const restaurants = await prisma.restaurant.findMany({
        select: {
            cover: true,
            preview: true,
            orderQrCode: true,
            menuImages: true,
        },
    });

    let restaurantImageCount = 0;

    for (const restaurant of restaurants) {
        const coverFilename = extractImageFilename(restaurant.cover);

        if (coverFilename) {
            imageSet.add(coverFilename);
            restaurantImageCount++;
        }

        if (restaurant.orderQrCode) {
            const qrFilename = extractImageFilename(restaurant.orderQrCode);

            if (qrFilename) {
                imageSet.add(qrFilename);
                restaurantImageCount++;
            }
        }

        for (const img of [...restaurant.preview, ...restaurant.menuImages]) {
            const filename = extractImageFilename(img);

            if (filename) {
                imageSet.add(filename);
                restaurantImageCount++;
            }
        }
    }

    console.log(`   ✓ 餐厅图片: ${restaurantImageCount} 张 (封面 + 预览 + 二维码 + 菜单)`);

    // 3. 活动图片
    const activities = await prisma.activity.findMany({
        select: { images: true },
    });

    let activityImageCount = 0;

    for (const activity of activities) {
        for (const img of activity.images) {
            const filename = extractImageFilename(img);

            if (filename) {
                imageSet.add(filename);
                activityImageCount++;
            }
        }
    }

    console.log(`   ✓ 活动图片: ${activityImageCount} 张`);
    console.log(`\n   📌 数据库中共引用 ${imageSet.size} 个不重复的图片文件\n`);

    return imageSet;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
    try {
        console.log('🧹 开始智能清理未使用的图片...\n');

        // 1. 收集数据库中使用的图片
        const usedImages = await collectUsedImages();

        // 2. 扫描上传目录中的所有图片
        const uploadsDir = join(process.cwd(), 'uploads', 'images');
        const allFiles = readdirSync(uploadsDir);

        console.log(`📂 上传目录中共有 ${allFiles.length} 个文件\n`);

        // 3. 找出未使用的图片
        const unusedImages: Array<{ filename: string; size: number }> = [];
        let totalUnusedSize = 0;

        for (const filename of allFiles) {
            if (!usedImages.has(filename)) {
                const filePath = join(uploadsDir, filename);
                const stats = statSync(filePath);

                unusedImages.push({ filename, size: stats.size });
                totalUnusedSize += stats.size;
            }
        }

        if (unusedImages.length === 0) {
            console.log('✅ 没有发现未使用的图片！所有图片都在使用中。');

            return;
        }

        // 4. 显示未使用的图片列表
        console.log(
            `🗑️  发现 ${unusedImages.length} 个未使用的图片 (总计 ${formatSize(totalUnusedSize)}):\n`
        );

        // 按大小排序，显示前 10 个最大的文件
        const sortedBySize = [...unusedImages].sort((a, b) => b.size - a.size);
        const displayCount = Math.min(10, sortedBySize.length);

        console.log('   最大的文件：');

        for (let i = 0; i < displayCount; i++) {
            const { filename, size } = sortedBySize[i];

            console.log(`   ${i + 1}. ${filename} - ${formatSize(size)}`);
        }

        if (sortedBySize.length > displayCount) {
            console.log(`   ... 还有 ${sortedBySize.length - displayCount} 个文件\n`);
        } else {
            console.log('');
        }

        // 5. 询问是否删除
        console.log('⚠️  确定要删除这些未使用的图片吗？');
        console.log('   输入 "yes" 确认删除，其他任意键取消：');

        const input = await new Promise<string>((resolve) => {
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim().toLowerCase());
            });
        });

        if (input !== 'yes') {
            console.log('\n❌ 已取消删除操作');

            return;
        }

        // 6. 删除未使用的图片
        console.log('\n🗑️  正在删除未使用的图片...');
        let deletedCount = 0;

        for (const { filename } of unusedImages) {
            const filePath = join(uploadsDir, filename);

            try {
                unlinkSync(filePath);
                deletedCount++;
            } catch (error: any) {
                console.warn(`   ⚠️  删除失败: ${filename} - ${error.message}`);
            }
        }

        console.log(`\n✅ 清理完成！`);
        console.log(`   删除文件: ${deletedCount}/${unusedImages.length}`);
        console.log(`   释放空间: ${formatSize(totalUnusedSize)}`);
        console.log(`   剩余文件: ${allFiles.length - deletedCount} 个`);
    } catch (error: any) {
        console.error('❌ 清理失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

main();
