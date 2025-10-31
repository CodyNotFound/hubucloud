import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

/**
 * GET /api/admin/config
 * 获取配置列表（管理员）
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const keyword = searchParams.get('keyword');
        const key = searchParams.get('key');

        // 如果指定了 key，返回单个配置
        if (key) {
            const config = await db.config.findUnique({
                where: { key },
            });
            return ResponseUtil.success(config);
        }

        // 否则返回配置列表
        const skip = (page - 1) * limit;

        const where: any = {};
        if (keyword) {
            where.OR = [{ key: { contains: keyword } }, { description: { contains: keyword } }];
        }

        const [configs, total] = await Promise.all([
            db.config.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ createdAt: 'desc' }],
            }),
            db.config.count({ where }),
        ]);

        return ResponseUtil.success({
            list: configs,
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
        return ResponseUtil.serverError('获取配置列表失败', error as Error);
    }
}

/**
 * POST /api/admin/config
 * 创建新配置（管理员）
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request);

        const body = await request.json();
        const { key, value, description } = body;

        // 验证必填字段
        if (!key || !value) {
            return ResponseUtil.error('配置键和值不能为空', 400);
        }

        // 检查 key 是否已存在
        const existing = await db.config.findUnique({
            where: { key },
        });

        if (existing) {
            return ResponseUtil.error('配置键已存在', 400);
        }

        const config = await db.config.create({
            data: {
                key,
                value,
                description,
            },
        });

        return ResponseUtil.success(config, '配置创建成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('创建配置失败', error as Error);
    }
}
