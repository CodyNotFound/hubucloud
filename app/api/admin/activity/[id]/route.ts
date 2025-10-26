import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

/**
 * PUT /api/admin/activity/[id]
 * 更新活动信息（管理员）
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        const body = await request.json();
        const { title, content, images, enabled, type, imageUrl, buttonText, autoOpen } = body;

        // 检查活动是否存在
        const existingActivity = await db.activity.findUnique({
            where: { id },
        });

        if (!existingActivity) {
            return ResponseUtil.error('活动不存在', 404);
        }

        const activity = await db.activity.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(images !== undefined && { images }),
                ...(enabled !== undefined && { enabled }),
                ...(type !== undefined && { type }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(buttonText !== undefined && { buttonText }),
                ...(autoOpen !== undefined && { autoOpen }),
            },
        });

        return ResponseUtil.success(activity, '活动更新成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('更新活动失败', error as Error);
    }
}

/**
 * DELETE /api/admin/activity/[id]
 * 删除活动（管理员）
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);
        const { id } = await params;

        // 检查活动是否存在
        const existingActivity = await db.activity.findUnique({
            where: { id },
        });

        if (!existingActivity) {
            return ResponseUtil.error('活动不存在', 404);
        }

        await db.activity.delete({
            where: { id },
        });

        return ResponseUtil.success(null, '活动删除成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('删除活动失败', error as Error);
    }
}
