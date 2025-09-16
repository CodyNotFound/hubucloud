import type { Context } from 'hono';

import { Controller } from '@/decorators/controller';
import { Get } from '@/decorators/http';
import { Param } from '@/decorators/params';
import { Required } from '@/decorators/validation';

/**
 * 静态文件服务控制器
 * 处理上传文件的访问
 */
@Controller('/api/uploads')
export class StaticController {
    /**
     * 获取上传的图片文件
     */
    @Get('/images/:filename')
    async getImage(c: Context, @Param('filename') @Required() filename: string) {
        try {
            // 验证文件名格式，防止路径遍历攻击
            if (!/^[a-zA-Z0-9_.-]+\.(webp|jpg|jpeg|png|gif)$/i.test(filename)) {
                return c.notFound();
            }

            // 构建文件路径
            const filePath = `./uploads/images/${filename}`;

            // 检查文件是否存在
            const file = Bun.file(filePath);
            const exists = await file.exists();

            if (!exists) {
                return c.notFound();
            }

            // 获取文件扩展名来设置正确的Content-Type
            const ext = filename.split('.').pop()?.toLowerCase();
            let contentType = 'image/webp';

            switch (ext) {
                case 'jpg':
                case 'jpeg':
                    contentType = 'image/jpeg';
                    break;
                case 'png':
                    contentType = 'image/png';
                    break;
                case 'gif':
                    contentType = 'image/gif';
                    break;
                case 'webp':
                    contentType = 'image/webp';
                    break;
            }

            // 设置缓存头
            c.header('Cache-Control', 'public, max-age=31536000'); // 1年缓存
            c.header('Content-Type', contentType);

            // 返回文件内容
            return c.body(file.stream());
        } catch (error) {
            console.error('获取图片文件失败:', error);
            return c.notFound();
        }
    }

    /**
     * 获取文件信息（不返回文件内容）
     */
    @Get('/images/:filename/info')
    async getImageInfo(c: Context, @Param('filename') @Required() filename: string) {
        try {
            // 验证文件名格式
            if (!/^[a-zA-Z0-9_.-]+\.(webp|jpg|jpeg|png|gif)$/i.test(filename)) {
                return c.json({ error: '无效的文件名' }, 400);
            }

            // 构建文件路径
            const filePath = `./uploads/images/${filename}`;
            const file = Bun.file(filePath);
            const exists = await file.exists();

            if (!exists) {
                return c.json({ error: '文件不存在' }, 404);
            }

            const stats = {
                filename,
                size: file.size,
                type: file.type,
                lastModified: new Date(file.lastModified).toISOString(),
                url: `/api/uploads/images/${filename}`,
            };

            return c.json(stats);
        } catch (error) {
            console.error('获取文件信息失败:', error);
            return c.json({ error: '获取文件信息失败' }, 500);
        }
    }
}
