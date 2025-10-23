import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取图片API端点
 * 用于解决生产环境中静态文件访问问题
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;

        // 验证文件名格式，防止路径遍历攻击
        if (!filename || typeof filename !== 'string') {
            return NextResponse.json({ error: '文件名无效' }, { status: 400 });
        }

        // 只允许特定扩展名的图片文件
        const allowedExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];
        const extension = path.extname(filename.toLowerCase());
        if (!allowedExtensions.includes(extension)) {
            return NextResponse.json({ error: '不支持的文件格式' }, { status: 400 });
        }

        // 构建文件路径
        const filePath = path.join(process.cwd(), 'uploads', 'images', filename);

        // 检查文件是否存在
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: '图片文件不存在' }, { status: 404 });
        }

        // 读取文件
        const fileBuffer = await readFile(filePath);

        // 根据文件扩展名设置正确的Content-Type
        const mimeTypes: Record<string, string> = {
            '.webp': 'image/webp',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
        };

        const contentType = mimeTypes[extension] || 'application/octet-stream';

        // 返回图片文件
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 缓存24小时
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('获取图片失败:', error);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}
