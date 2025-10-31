import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

/**
 * PUT /api/admin/config/[key]
 * 更新配置（管理员）
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        await requireAdmin(request);

        const { key } = await params;
        const body = await request.json();
        const { value, description } = body;

        // 验证必填字段
        if (!value) {
            return ResponseUtil.error('配置值不能为空', 400);
        }

        // 检查配置是否存在
        const existing = await db.config.findUnique({
            where: { key },
        });

        if (!existing) {
            return ResponseUtil.error('配置不存在', 404);
        }

        const config = await db.config.update({
            where: { key },
            data: {
                value,
                description,
            },
        });

        return ResponseUtil.success(config, '配置更新成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('更新配置失败', error as Error);
    }
}

/**
 * DELETE /api/admin/config/[key]
 * 删除配置（管理员）
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        await requireAdmin(request);

        const { key } = await params;

        // 检查配置是否存在
        const existing = await db.config.findUnique({
            where: { key },
        });

        if (!existing) {
            return ResponseUtil.error('配置不存在', 404);
        }

        await db.config.delete({
            where: { key },
        });

        return ResponseUtil.success(null, '配置删除成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('删除配置失败', error as Error);
    }
}
