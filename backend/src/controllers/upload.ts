import type { Context } from 'hono';

import sharp from 'sharp';

import { Controller } from '@/decorators/controller';
import { Post } from '@/decorators/http';
import { ResponseUtil } from '@/core/response';

/**
 * 文件上传控制器
 * 处理图片上传和压缩功能
 */
@Controller('/api/upload')
export class UploadController {
    /**
     * 上传并压缩图片
     * 支持多种格式，自动压缩为WebP格式
     */
    @Post('/image')
    async uploadImage(c: Context) {
        try {
            // 获取上传的文件
            const body = await c.req.parseBody();
            const file = body['image'] as File;

            if (!file) {
                return ResponseUtil.clientError(c, '请选择要上传的图片');
            }

            // 验证文件类型
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            if (!allowedTypes.includes(file.type)) {
                return ResponseUtil.clientError(
                    c,
                    '不支持的图片格式，请上传JPG、PNG、GIF或WebP格式的图片'
                );
            }

            // 验证文件大小 (最大20MB)
            const maxSize = 20 * 1024 * 1024; // 20MB
            if (file.size > maxSize) {
                return ResponseUtil.clientError(c, '图片文件过大，请选择小于20MB的图片');
            }

            // 读取文件内容
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 使用Sharp压缩图片
            const processedImage = await sharp(buffer)
                .resize(800, 600, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: 80 })
                .toBuffer();

            // 生成文件名
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 8);
            const fileName = `restaurant_${timestamp}_${randomString}.webp`;

            // 创建上传目录（如果不存在）
            const uploadDir = './uploads/images';
            await Bun.write(`${uploadDir}/.gitkeep`, ''); // 确保目录存在

            // 保存文件
            const filePath = `${uploadDir}/${fileName}`;
            await Bun.write(filePath, processedImage);

            // 生成访问URL
            const imageUrl = `/api/uploads/images/${fileName}`;

            return ResponseUtil.success(
                c,
                {
                    filename: fileName,
                    url: imageUrl,
                    size: processedImage.length,
                    originalSize: file.size,
                    compressionRatio: Math.round((1 - processedImage.length / file.size) * 100),
                },
                '图片上传成功'
            );
        } catch (error) {
            console.error('图片上传失败:', error);
            return ResponseUtil.serverError(c, '图片上传失败', error as Error);
        }
    }

    /**
     * 批量上传图片
     * 支持一次上传多张图片
     */
    @Post('/images')
    async uploadImages(c: Context) {
        try {
            const body = await c.req.parseBody();

            // 获取所有上传的文件
            const files: File[] = [];
            for (const [key, value] of Object.entries(body)) {
                if (key.startsWith('images') && value instanceof File) {
                    files.push(value);
                }
            }

            if (files.length === 0) {
                return ResponseUtil.clientError(c, '请选择要上传的图片');
            }

            // 限制批量上传数量
            if (files.length > 10) {
                return ResponseUtil.clientError(c, '一次最多只能上传10张图片');
            }

            const results = [];
            const errors = [];

            // 处理每个文件
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                try {
                    // 验证文件类型
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

                    // 验证文件大小
                    const maxSize = 20 * 1024 * 1024; // 20MB
                    if (file.size > maxSize) {
                        errors.push(`文件${i + 1}: 文件过大`);
                        continue;
                    }

                    // 处理图片
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const processedImage = await sharp(buffer)
                        .resize(800, 600, {
                            fit: 'inside',
                            withoutEnlargement: true,
                        })
                        .webp({ quality: 80 })
                        .toBuffer();

                    // 生成文件名
                    const timestamp = Date.now();
                    const randomString = Math.random().toString(36).substring(2, 8);
                    const fileName = `restaurant_${timestamp}_${i}_${randomString}.webp`;

                    // 保存文件
                    const uploadDir = './uploads/images';
                    const filePath = `${uploadDir}/${fileName}`;
                    await Bun.write(filePath, processedImage);

                    // 生成访问URL
                    const imageUrl = `/api/uploads/images/${fileName}`;

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
                c,
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
            console.error('批量上传失败:', error);
            return ResponseUtil.serverError(c, '批量上传失败', error as Error);
        }
    }
}
