#!/usr/bin/env bun
import { readFileSync, existsSync, readdirSync, copyFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 解压 ZIP 备份文件
 */
function extractZip(zipFile: string): string {
    const extractDir = zipFile.replace(/\.zip$/, '');

    console.log(`📦 正在解压备份文件: ${zipFile}`);

    try {
        // 使用系统的 unzip 命令，-q 安静模式，-o 覆盖已存在的文件
        execSync(`unzip -q -o "${zipFile}"`, {
            cwd: process.cwd(),
            stdio: 'pipe',
        });

        console.log(`   ✓ 解压完成: ${extractDir}\n`);

        return extractDir;
    } catch (error: any) {
        throw new Error(`解压失败: ${error.message}`);
    }
}

/**
 * 恢复图片文件
 */
function restoreImages(backupDir: string): number {
    const imagesBackupDir = join(backupDir, 'images');

    if (!existsSync(imagesBackupDir)) {
        console.log('⚠️  备份中没有图片目录，跳过图片恢复');

        return 0;
    }

    const targetDir = join(process.cwd(), 'uploads', 'images');

    mkdirSync(targetDir, { recursive: true });

    const imageFiles = readdirSync(imagesBackupDir);
    let successCount = 0;

    for (const filename of imageFiles) {
        const sourcePath = join(imagesBackupDir, filename);
        const destPath = join(targetDir, filename);

        try {
            copyFileSync(sourcePath, destPath);
            successCount++;
        } catch (error: any) {
            console.warn(`⚠️  恢复图片失败: ${filename} - ${error.message}`);
        }
    }

    return successCount;
}

async function main() {
    const [backupPath] = process.argv.slice(2);

    if (!backupPath) {
        console.log('用法: bun run restore <备份目录>');
        console.log('示例: bun run restore backup_2025-01-23');
        console.log('\n或者: bun run restore <备份文件.json> (仅数据恢复)');
        process.exit(1);
    }

    if (!existsSync(backupPath)) {
        console.error(`❌ 路径不存在: ${backupPath}`);
        process.exit(1);
    }

    try {
        let dataFile: string;
        let backupDir: string | null = null;
        let isLegacyBackup = false;
        let shouldCleanup = false;

        // 判断是 ZIP 压缩文件、备份目录还是旧版 JSON 文件
        if (backupPath.endsWith('.zip')) {
            // ZIP 压缩备份
            backupDir = extractZip(backupPath);
            shouldCleanup = true; // 解压后需要清理临时目录
            dataFile = join(backupDir, 'data.json');

            if (!existsSync(dataFile)) {
                console.error(`❌ 备份中没有找到 data.json: ${backupDir}`);
                process.exit(1);
            }

            console.log(`📥 开始恢复数据库 (ZIP 压缩备份)\n`);
        } else if (backupPath.endsWith('.json')) {
            // 旧版备份：单个 JSON 文件
            dataFile = backupPath;
            isLegacyBackup = true;
            console.log(`📥 开始恢复数据库 (旧版备份): ${backupPath}\n`);
        } else {
            // 新版备份：目录结构
            backupDir = backupPath;
            dataFile = join(backupDir, 'data.json');

            if (!existsSync(dataFile)) {
                console.error(`❌ 备份目录中没有找到 data.json: ${backupDir}`);
                process.exit(1);
            }

            console.log(`📥 开始恢复数据库 (新版备份): ${backupPath}\n`);
        }

        // 1. 读取备份数据
        console.log('📖 正在读取备份数据...');
        const fileContent = readFileSync(dataFile, 'utf-8');
        const data = JSON.parse(fileContent);

        console.log(`   ✓ 备份时间: ${data.backupTime || '未知'}`);

        if (data.stats) {
            console.log(
                `   ✓ 数据统计: 用户${data.stats.totalUsers} | 餐厅${data.stats.totalRestaurants} | 兼职${data.stats.totalParttimes} | 活动${data.stats.totalActivities} | 图片${data.stats.totalImages}\n`
            );
        }

        // 2. 清空现有数据
        console.log('🗑️  清空现有数据...');
        await prisma.activity.deleteMany();
        await prisma.parttime.deleteMany();
        await prisma.restaurant.deleteMany();
        await prisma.user.deleteMany();
        console.log('   ✓ 已清空所有数据表\n');

        // 3. 恢复数据库数据
        console.log('💾 正在恢复数据库数据...');
        const results = {
            users: 0,
            restaurants: 0,
            parttimes: 0,
            activities: 0,
        };

        if (data.users?.length > 0) {
            await prisma.user.createMany({ data: data.users });
            results.users = data.users.length;
            console.log(`   ✓ 已恢复用户: ${results.users}`);
        }

        if (data.restaurants?.length > 0) {
            await prisma.restaurant.createMany({ data: data.restaurants });
            results.restaurants = data.restaurants.length;
            console.log(`   ✓ 已恢复餐厅: ${results.restaurants}`);
        }

        if (data.parttimes?.length > 0) {
            await prisma.parttime.createMany({ data: data.parttimes });
            results.parttimes = data.parttimes.length;
            console.log(`   ✓ 已恢复兼职: ${results.parttimes}`);
        }

        if (data.activities?.length > 0) {
            await prisma.activity.createMany({ data: data.activities });
            results.activities = data.activities.length;
            console.log(`   ✓ 已恢复活动: ${results.activities}`);
        }

        console.log('');

        // 4. 恢复图片（仅新版备份）
        if (!isLegacyBackup && backupDir) {
            console.log('🖼️  正在恢复图片...');
            const restoredImages = restoreImages(backupDir);

            console.log(`   ✓ 已恢复图片: ${restoredImages}\n`);
        }

        // 5. 清理临时文件
        if (shouldCleanup && backupDir) {
            console.log('🧹 清理临时文件...');
            rmSync(backupDir, { recursive: true, force: true });
            console.log('   ✓ 临时文件已清理\n');
        }

        // 6. 完成提示
        console.log('✅ 数据库恢复完成!');

        if (isLegacyBackup) {
            console.log('⚠️  注意: 这是旧版备份，图片未恢复。建议使用新版备份功能。');
        }
    } catch (error: any) {
        console.error('❌ 恢复失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
