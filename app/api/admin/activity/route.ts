import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

/**
 * GET /api/admin/activity
 * 获取活动列表（管理员）
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const keyword = searchParams.get('keyword');

        const skip = (page - 1) * limit;

        const where: any = {};
        if (keyword) {
            where.content = { contains: keyword };
        }

        const [activities, total] = await Promise.all([
            db.activity.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ createdAt: 'desc' }],
            }),
            db.activity.count({ where }),
        ]);

        return ResponseUtil.success({
            list: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('获取活动列表失败', error as Error);
    }
}

/**
 * POST /api/admin/activity
 * 创建新活动（管理员）
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request);

        const body = await request.json();
        const { content, images, enabled } = body;

        // 验证必填字段
        if (!content) {
            return ResponseUtil.error('内容不能为空', 400);
        }

        const activity = await db.activity.create({
            data: {
                content,
                images: images || [],
                enabled: enabled ?? true,
            },
        });

        return ResponseUtil.success(activity, '活动发布成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('发布活动失败', error as Error);
    }
}
