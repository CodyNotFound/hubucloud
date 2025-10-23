import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import { NextRequest } from 'next/server';
import sharp from 'sharp';

import { ResponseUtil } from '@/lib/response';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const files: File[] = [];
        const entries = Array.from(formData.entries());
        for (const [key, value] of entries) {
            if (key.startsWith('images') && value instanceof File) {
                files.push(value);
            }
        }

        if (files.length === 0) {
            return ResponseUtil.clientError('请选择要上传的图片');
        }

        if (files.length > 10) {
            return ResponseUtil.clientError('一次最多只能上传10张图片');
        }

        const results = [];
        const errors = [];

        const uploadDir = path.join(process.cwd(), 'uploads', 'images');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const allowedTypes = [
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/gif',
                    'image/webp',
                ];
                if (!allowedTypes.includes(file.type)) {
                    errors.push(`文件${i + 1}: 不支持的图片格式`);
                    continue;
                }

                const maxSize = 20 * 1024 * 1024; // 20MB
                if (file.size > maxSize) {
                    errors.push(`文件${i + 1}: 文件过大`);
                    continue;
                }

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const processedImage = await sharp(buffer)
                    .resize(800, 600, {
                        fit: 'inside',
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 80 })
                    .toBuffer();

                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 8);
                const fileName = `restaurant_${timestamp}_${i}_${randomString}.webp`;

                const filePath = path.join(uploadDir, fileName);
                await writeFile(filePath, new Uint8Array(processedImage));

                const imageUrl = `/api/images/${fileName}`;

                results.push({
                    filename: fileName,
                    url: imageUrl,
                    size: processedImage.length,
                    originalSize: file.size,
                    compressionRatio: Math.round((1 - processedImage.length / file.size) * 100),
                });
            } catch (error) {
                console.error(`处理文件${i + 1}失败:`, error);
                errors.push(`文件${i + 1}: 处理失败`);
            }
        }

        return ResponseUtil.success(
            {
                success: results,
                errors: errors,
                total: files.length,
                successCount: results.length,
                errorCount: errors.length,
            },
            `成功上传${results.length}张图片${errors.length > 0 ? `，${errors.length}张失败` : ''}`
        );
    } catch (error) {
        return ResponseUtil.serverError('批量上传失败', error as Error);
    }
}
