import { existsSync, readdirSync } from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';

/**
 * 数据库图片URL迁移脚本
 * 将数据库中的静态图片URL替换为API端点URL
 */

const prisma = new PrismaClient();

interface MigrationResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: string[];
}

/**
 * 从URL中提取文件名
 */
function extractFilenameFromUrl(url: string): string | null {
    try {
        // 处理相对路径，如 /uploads/images/filename.webp
        if (url.startsWith('/uploads/images/')) {
            return url.replace('/uploads/images/', '');
        }

        // 处理完整URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        if (pathname.includes('/uploads/images/')) {
            return pathname.split('/uploads/images/')[1];
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * 验证文件是否存在
 */
function verifyFileExists(filename: string): boolean {
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'images', filename);
    return existsSync(filePath);
}

/**
 * 获取所有现有图片文件
 */
function getExistingImageFiles(): string[] {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');

    if (!existsSync(uploadsDir)) {
        console.log('上传目录不存在:', uploadsDir);
        return [];
    }

    return readdirSync(uploadsDir).filter((file) => {
        const ext = path.extname(file.toLowerCase());
        return ['.webp', '.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
}

/**
 * 迁移餐厅封面图片
 */
async function migrateRestaurantCovers(): Promise<MigrationResult> {
    const result: MigrationResult = {
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
    };

    try {
        const restaurants = await prisma.restaurant.findMany({
            select: { id: true, cover: true },
        });

        result.totalProcessed = restaurants.length;

        for (const restaurant of restaurants) {
            try {
                if (!restaurant.cover || restaurant.cover.startsWith('/api/images/')) {
                    // 已经是新格式或为空，跳过
                    continue;
                }

                const filename = extractFilenameFromUrl(restaurant.cover);
                if (!filename) {
                    result.errors.push(`餐厅 ${restaurant.id}: 无法解析文件名`);
                    result.errorCount++;
                    continue;
                }

                if (!verifyFileExists(filename)) {
                    result.errors.push(`餐厅 ${restaurant.id}: 文件不存在 ${filename}`);
                    result.errorCount++;
                    continue;
                }

                const newUrl = `/api/images/${filename}`;

                await prisma.restaurant.update({
                    where: { id: restaurant.id },
                    data: { cover: newUrl },
                });

                result.successCount++;
                console.log(`✓ 更新餐厅 ${restaurant.id} 封面图片: ${newUrl}`);
            } catch (error) {
                result.errors.push(`餐厅 ${restaurant.id}: ${error}`);
                result.errorCount++;
            }
        }
    } catch (error) {
        result.errors.push(`查询餐厅数据失败: ${error}`);
        result.errorCount++;
    }

    return result;
}

/**
 * 迁移餐厅预览图片
 */
async function migrateRestaurantPreviews(): Promise<MigrationResult> {
    const result: MigrationResult = {
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
    };

    try {
        const restaurants = await prisma.restaurant.findMany({
            select: { id: true, preview: true },
        });

        result.totalProcessed = restaurants.length;

        for (const restaurant of restaurants) {
            try {
                if (!restaurant.preview || restaurant.preview.length === 0) {
                    continue;
                }

                let hasChanges = false;
                const newPreviews: string[] = [];

                for (const previewUrl of restaurant.preview) {
                    if (previewUrl.startsWith('/api/images/')) {
                        // 已经是新格式
                        newPreviews.push(previewUrl);
                        continue;
                    }

                    const filename = extractFilenameFromUrl(previewUrl);
                    if (!filename) {
                        result.errors.push(
                            `餐厅 ${restaurant.id}: 预览图片无法解析文件名 ${previewUrl}`
                        );
                        newPreviews.push(previewUrl); // 保留原URL
                        continue;
                    }

                    if (!verifyFileExists(filename)) {
                        result.errors.push(`餐厅 ${restaurant.id}: 预览图片文件不存在 ${filename}`);
                        newPreviews.push(previewUrl); // 保留原URL
                        continue;
                    }

                    newPreviews.push(`/api/images/${filename}`);
                    hasChanges = true;
                }

                if (hasChanges) {
                    await prisma.restaurant.update({
                        where: { id: restaurant.id },
                        data: { preview: newPreviews },
                    });

                    result.successCount++;
                    console.log(`✓ 更新餐厅 ${restaurant.id} 预览图片 (${newPreviews.length}张)`);
                }
            } catch (error) {
                result.errors.push(`餐厅 ${restaurant.id}: ${error}`);
                result.errorCount++;
            }
        }
    } catch (error) {
        result.errors.push(`查询餐厅预览数据失败: ${error}`);
        result.errorCount++;
    }

    return result;
}

/**
 * 检查用户头像情况（仅用于信息显示，不进行迁移）
 * 用户头像使用外部API（dicebear.com），无需迁移
 */
async function checkUserAvatars(): Promise<MigrationResult> {
    const result: MigrationResult = {
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
    };

    try {
        const users = await prisma.user.findMany({
            select: { id: true, avatar: true },
        });

        result.totalProcessed = users.length;

        let dicebearCount = 0;
        let localImageCount = 0;
        let otherCount = 0;

        for (const user of users) {
            if (!user.avatar) {
                continue;
            }

            if (user.avatar.includes('dicebear.com')) {
                dicebearCount++;
            } else if (user.avatar.includes('/uploads/images/') || user.avatar.includes('/api/images/')) {
                localImageCount++;
            } else {
                otherCount++;
            }
        }

        console.log(`📊 用户头像统计:`);
        console.log(`  - Dicebear外部头像: ${dicebearCount}`);
        console.log(`  - 本地图片头像: ${localImageCount}`);
        console.log(`  - 其他类型: ${otherCount}`);

        result.successCount = result.totalProcessed; // 标记为成功，因为不需要实际迁移
    } catch (error) {
        result.errors.push(`查询用户数据失败: ${error}`);
        result.errorCount++;
    }

    return result;
}

/**
 * 主迁移函数
 */
async function main() {
    console.log('🚀 开始图片URL迁移...');
    console.log('');

    // 检查现有文件
    const existingFiles = getExistingImageFiles();
    console.log(`📁 发现 ${existingFiles.length} 个图片文件`);
    console.log('');

    // 迁移餐厅封面图片
    console.log('📸 迁移餐厅封面图片...');
    const coverResult = await migrateRestaurantCovers();
    console.log(
        `处理: ${coverResult.totalProcessed}, 成功: ${coverResult.successCount}, 错误: ${coverResult.errorCount}`
    );
    console.log('');

    // 迁移餐厅预览图片
    console.log('🖼️  迁移餐厅预览图片...');
    const previewResult = await migrateRestaurantPreviews();
    console.log(
        `处理: ${previewResult.totalProcessed}, 成功: ${previewResult.successCount}, 错误: ${previewResult.errorCount}`
    );
    console.log('');

    // 检查用户头像情况
    console.log('👤 检查用户头像情况...');
    const avatarResult = await checkUserAvatars();
    console.log(`总用户数: ${avatarResult.totalProcessed}`);
    console.log('');

    // 汇总结果
    const totalProcessed = coverResult.totalProcessed + previewResult.totalProcessed;
    const totalSuccess = coverResult.successCount + previewResult.successCount;
    const totalErrors = coverResult.errorCount + previewResult.errorCount;
    const allErrors = [...coverResult.errors, ...previewResult.errors];

    console.log('📊 迁移完成！');
    console.log(`总处理数量: ${totalProcessed}`);
    console.log(`成功数量: ${totalSuccess}`);
    console.log(`错误数量: ${totalErrors}`);

    if (allErrors.length > 0) {
        console.log('');
        console.log('❌ 错误详情:');
        allErrors.forEach((error) => console.log(`  - ${error}`));
    }

    await prisma.$disconnect();
}

// 运行迁移
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ 迁移失败:', error);
        process.exit(1);
    });
}

export { main as migrateImageUrls };
