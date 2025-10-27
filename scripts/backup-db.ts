#!/usr/bin/env bun
import { writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

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

    // 1. 用户头像
    const users = await prisma.user.findMany({ select: { avatar: true } });

    for (const user of users) {
        const filename = extractImageFilename(user.avatar);

        if (filename) imageSet.add(filename);
    }

    // 2. 餐厅相关图片
    const restaurants = await prisma.restaurant.findMany({
        select: {
            cover: true,
            preview: true,
            orderQrCode: true,
            menuImages: true,
        },
    });

    for (const restaurant of restaurants) {
        const coverFilename = extractImageFilename(restaurant.cover);

        if (coverFilename) imageSet.add(coverFilename);

        if (restaurant.orderQrCode) {
            const qrFilename = extractImageFilename(restaurant.orderQrCode);

            if (qrFilename) imageSet.add(qrFilename);
        }

        for (const img of [...restaurant.preview, ...restaurant.menuImages]) {
            const filename = extractImageFilename(img);

            if (filename) imageSet.add(filename);
        }
    }

    // 3. 活动图片
    const activities = await prisma.activity.findMany({
        select: { images: true },
    });

    for (const activity of activities) {
        for (const img of activity.images) {
            const filename = extractImageFilename(img);

            if (filename) imageSet.add(filename);
        }
    }

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

/**
 * 备份图片文件
 */
function backupImages(imageSet: Set<string>, backupDir: string): number {
    const imagesDir = join(backupDir, 'images');

    mkdirSync(imagesDir, { recursive: true });

    const sourceDir = join(process.cwd(), 'uploads', 'images');
    let successCount = 0;

    for (const filename of Array.from(imageSet)) {
        const sourcePath = join(sourceDir, filename);
        const destPath = join(imagesDir, filename);

        if (existsSync(sourcePath)) {
            try {
                copyFileSync(sourcePath, destPath);
                successCount++;
            } catch (error: any) {
                console.warn(`⚠️  复制图片失败: ${filename} - ${error.message}`);
            }
        } else {
            console.warn(`⚠️  图片不存在: ${filename}`);
        }
    }

    return successCount;
}

/**
 * 压缩备份目录为 ZIP 文件
 */
function compressBackup(backupDir: string): string {
    const backupDirName = backupDir.split('/').pop()!; // 提取目录名
    const backupBaseDir = join(process.cwd(), 'backup');
    const zipFile = `${backupDir}.zip`;

    console.log('🗜️  正在压缩备份文件...');

    try {
        // 在 backup 目录下执行压缩，只压缩目录名本身，避免路径嵌套
        execSync(`zip -r -9 -q "${backupDirName}.zip" "${backupDirName}"`, {
            cwd: backupBaseDir,
            stdio: 'pipe',
        });

        // 获取压缩前后的大小
        const getDirectorySize = (dir: string): number => {
            let totalSize = 0;
            // macOS 使用 -f%z，Linux 使用 --format=%s
            const statCmd = process.platform === 'darwin' ? '-f%z' : '--format=%s';
            const files = execSync(`find "${dir}" -type f -exec stat ${statCmd} {} \\;`, {
                encoding: 'utf-8',
            })
                .trim()
                .split('\n')
                .filter((line) => line); // 过滤空行

            for (const size of files) {
                const parsedSize = parseInt(size, 10);

                if (!isNaN(parsedSize)) {
                    totalSize += parsedSize;
                }
            }

            return totalSize;
        };

        const originalSize = getDirectorySize(backupDir);
        const compressedSize = statSync(zipFile).size;
        const compressionRatio =
            originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : '0.0';

        console.log(`   ✓ 原始大小: ${formatSize(originalSize)}`);
        console.log(`   ✓ 压缩后: ${formatSize(compressedSize)}`);
        console.log(`   ✓ 压缩率: ${compressionRatio}%\n`);

        // 删除原始目录
        rmSync(backupDir, { recursive: true, force: true });

        return zipFile;
    } catch (error: any) {
        console.error(`⚠️  压缩失败: ${error.message}`);
        console.log('   保留未压缩的备份目录');

        return backupDir;
    }
}

async function main() {
    try {
        console.log('📤 开始智能备份数据库...\n');

        // 1. 收集所有数据
        console.log('📊 正在收集数据...');
        const [users, restaurants, parttimes, activities, usedImages] = await Promise.all([
            prisma.user.findMany(),
            prisma.restaurant.findMany(),
            prisma.parttime.findMany(),
            prisma.activity.findMany(),
            collectUsedImages(),
        ]);

        console.log(`   ✓ 用户: ${users.length}`);
        console.log(`   ✓ 餐厅: ${restaurants.length}`);
        console.log(`   ✓ 兼职: ${parttimes.length}`);
        console.log(`   ✓ 活动: ${activities.length}`);
        console.log(`   ✓ 使用中的图片: ${usedImages.size}\n`);

        // 2. 创建备份目录
        const backupBaseDir = join(process.cwd(), 'backup');

        mkdirSync(backupBaseDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const backupDir = join(backupBaseDir, `backup_${timestamp}`);

        mkdirSync(backupDir, { recursive: true });

        // 3. 备份数据库数据
        console.log('💾 正在备份数据库数据...');
        const data = {
            users,
            restaurants,
            parttimes,
            activities,
            backupTime: new Date().toISOString(),
            stats: {
                totalUsers: users.length,
                totalRestaurants: restaurants.length,
                totalParttimes: parttimes.length,
                totalActivities: activities.length,
                totalImages: usedImages.size,
            },
        };

        const dataFile = join(backupDir, 'data.json');

        writeFileSync(dataFile, JSON.stringify(data, null, 2));
        console.log(`   ✓ 数据文件: ${dataFile}\n`);

        // 4. 备份图片
        console.log('🖼️  正在备份图片...');
        const copiedImages = backupImages(usedImages, backupDir);

        console.log(`   ✓ 已备份图片: ${copiedImages}/${usedImages.size}\n`);

        // 5. 创建备份说明文件
        const readme = `# 数据库备份

## 备份信息
- 备份时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
- 备份版本: v2.0 (包含图片)

## 数据统计
- 用户: ${users.length}
- 餐厅: ${restaurants.length}
- 兼职: ${parttimes.length}
- 活动: ${activities.length}
- 图片: ${copiedImages}/${usedImages.size}

## 文件说明
- data.json: 数据库数据
- images/: 使用中的图片文件

## 恢复方法
\`\`\`bash
bun run restore ${backupDir}
\`\`\`
`;

        writeFileSync(join(backupDir, 'README.md'), readme);

        // 6. 压缩备份
        const finalBackup = compressBackup(backupDir);

        // 7. 完成提示
        console.log('✅ 备份完成!');
        console.log(`📦 备份文件: ${finalBackup}`);
        console.log(`💡 恢复命令: bun run restore ${finalBackup}`);
    } catch (error: any) {
        console.error('❌ 备份失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
