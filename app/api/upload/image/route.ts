import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import { NextRequest } from 'next/server';
import sharp from 'sharp';

import { ResponseUtil } from '@/lib/response';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return ResponseUtil.clientError('请选择要上传的图片');
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return ResponseUtil.clientError(
                '不支持的图片格式，请上传JPG、PNG、GIF或WebP格式的图片'
            );
        }

        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            return ResponseUtil.clientError('图片文件过大，请选择小于20MB的图片');
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
        const fileName = `restaurant_${timestamp}_${randomString}.webp`;

        const uploadDir = path.join(process.cwd(), 'uploads', 'images');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, new Uint8Array(processedImage));

        const imageUrl = `/api/images/${fileName}`;

        return ResponseUtil.success(
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
        return ResponseUtil.serverError('图片上传失败', error as Error);
    }
}
