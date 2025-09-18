#!/usr/bin/env bun

/**
 * 餐厅数据重新导入脚本
 * 适应新的 Next.js App Router 结构
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const prisma = new PrismaClient();

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function main() {
    console.log('🚀 开始餐厅数据重新导入...');

    try {
        // 1. 清理现有餐厅数据
        console.log('📝 清理现有餐厅数据...');
        await prisma.restaurant.deleteMany({});
        console.log('✅ 已清理现有餐厅数据');

        // 2. 读取 CSV 数据
        console.log('📖 读取餐厅数据...');
        const csvPath = join(rootDir, 'migration', 'restaurants.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = parseCSVLine(lines[0]);

        console.log(`📊 找到 ${lines.length - 1} 条餐厅记录`);

        // 3. 创建 public/uploads/images 目录
        const publicUploadsDir = join(rootDir, 'public', 'uploads', 'images');
        if (!existsSync(publicUploadsDir)) {
            mkdirSync(publicUploadsDir, { recursive: true });
            console.log('📁 已创建 public/uploads/images 目录');
        }

        // 4. 处理每条记录
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
            try {
                const data = parseCSVRecord(headers, parseCSVLine(lines[i]));

                if (!data.name) continue; // 跳过无效记录

                // 处理图片路径并复制文件
                const { coverUrl, previewUrls } = await processImages(data, publicUploadsDir);

                // 映射旧的分类到新的枚举
                const restaurantType = mapCategoryToType(data.category || '');

                // 创建餐厅记录
                await prisma.restaurant.create({
                    data: {
                        name: data.name,
                        address: data.location || '',
                        phone: data.phone || '',
                        description: data.description || `欢迎来到${data.name}，品尝美味佳肴。`,
                        type: restaurantType,
                        cover: coverUrl,
                        tags: mapCategoryToTags(data.category || ''),
                        preview: previewUrls,
                        openTime: data.opening_hours || '营业时间请咨询',
                        rating: 5, // 默认评分
                        latitude: 30.5951, // 湖北大学坐标
                        longitude: 114.4086,
                        locationDescription: data.location || '',
                    }
                });

                successCount++;
                console.log(`✅ [${i}/${lines.length - 1}] 导入成功: ${data.name}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ [${i}/${lines.length - 1}] 导入失败:`, error);
            }
        }

        console.log(`\n🎉 导入完成!`);
        console.log(`✅ 成功: ${successCount} 条`);
        console.log(`❌ 失败: ${errorCount} 条`);

    } catch (error) {
        console.error('💥 导入过程中发生错误:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * 解析 CSV 行（处理引号内的逗号）
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * 将 CSV 数据转换为对象
 */
function parseCSVRecord(headers: string[], values: string[]): Record<string, string> {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
        record[header.replace(/"/g, '')] = values[index]?.replace(/"/g, '') || '';
    });
    return record;
}

/**
 * 处理图片文件
 */
async function processImages(data: any, publicUploadsDir: string) {
    let coverUrl = '/logo.png'; // 默认封面
    const previewUrls: string[] = [];

    try {
        // 处理封面图片
        if (data.images && data.images.trim() !== '' && data.images !== '[]') {
            let imageData = data.images;

            // 如果数据不是以 [ 开头，说明是无效数据
            if (!imageData.startsWith('[')) {
                console.warn(`无效的图片数据格式: ${data.name} -> ${imageData}`);
                return { coverUrl, previewUrls };
            }

            // 手动处理 CSV 解析后的数组字符串
            // 从 [/path1,/path2] 转换为 ["/path1","/path2"]
            imageData = imageData.replace(/([^,\[\]]+)/g, '"$1"');

            const images = JSON.parse(imageData);
            if (Array.isArray(images) && images.length > 0) {
                const firstImage = images[0];
                coverUrl = await copyImageFile(firstImage, publicUploadsDir);

                // 处理预览图片（最多前5张）
                for (let i = 1; i < Math.min(images.length, 6); i++) {
                    const previewUrl = await copyImageFile(images[i], publicUploadsDir);
                    if (previewUrl && previewUrl !== '/logo.png') {
                        previewUrls.push(previewUrl);
                    }
                }
            }
        }
    } catch (error) {
        console.warn(`警告: 处理图片失败 ${data.name} (${data.images}):`, error);
    }

    return { coverUrl, previewUrls };
}

/**
 * 处理并压缩图片文件
 */
async function copyImageFile(imagePath: string, publicUploadsDir: string): Promise<string> {
    try {
        if (!imagePath || !imagePath.includes('/api/upload/')) {
            return '/logo.png';
        }

        // 从 /api/upload/2025/... 提取相对路径
        const relativePath = imagePath.replace('/api/upload/', '');
        const sourceFile = join(rootDir, 'migration', 'uploads', relativePath);

        if (!existsSync(sourceFile)) {
            console.warn(`图片文件不存在: ${sourceFile}`);
            return '/logo.png';
        }

        // 生成新的文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const newFileName = `restaurant_${timestamp}_${randomString}.webp`;

        const destFile = join(publicUploadsDir, newFileName);

        // 使用 sharp 压缩图片
        const processedImage = await sharp(sourceFile)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({
                quality: 75,  // 降低质量以减小文件大小
                effort: 6     // 提高压缩效率
            })
            .toBuffer();

        // 写入压缩后的图片
        writeFileSync(destFile, processedImage);

        const originalSize = (await import('fs')).statSync(sourceFile).size;
        const newSize = processedImage.length;
        const compressionRatio = Math.round((1 - newSize / originalSize) * 100);

        console.log(`📷 压缩图片: ${imagePath} -> /uploads/images/${newFileName} (${Math.round(originalSize/1024)}KB -> ${Math.round(newSize/1024)}KB, 压缩${compressionRatio}%)`);

        return `/uploads/images/${newFileName}`;
    } catch (error) {
        console.warn(`处理图片文件失败: ${imagePath}`, error);
        return '/logo.png';
    }
}

/**
 * 映射旧分类到新枚举（保持原始值）
 */
function mapCategoryToType(category: string): string {
    const categoryMap: Record<string, string> = {
        'campusfood': 'campusfood',
        'mainfood': 'mainfood',
        'drinks': 'drinks',
        'nightmarket': 'nightmarket',
    };
    return categoryMap[category] || 'campusfood';
}

/**
 * 映射分类到标签
 */
function mapCategoryToTags(category: string): string[] {
    const tagMap: Record<string, string[]> = {
        'campusfood': ['校园', '学生餐', '食堂'],
        'mainfood': ['正餐', '主食', '米饭'],
        'drinks': ['饮品', '奶茶', '果汁'],
        'nightmarket': ['夜宵', '烧烤', '宵夜'],
    };
    return tagMap[category] || ['美食'];
}

// 运行脚本
main().catch(console.error);