import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request);

        const body = await request.json();
        const { targetUserId } = body;

        if (!targetUserId) {
            return ResponseUtil.clientError('目标用户ID不能为空');
        }

        const targetUser = await db.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                user: true,
                name: true,
                role: true,
            },
        });

        if (!targetUser) {
            return ResponseUtil.clientError('目标用户不存在', 404);
        }

        if (targetUser.role === 'ADMIN') {
            return ResponseUtil.clientError('用户已经是管理员', 400);
        }

        const updatedUser = await db.user.update({
            where: { id: targetUserId },
            data: { role: 'ADMIN' },
            select: {
                id: true,
                user: true,
                name: true,
                avatar: true,
                phone: true,
                studentId: true,
                major: true,
                grade: true,
                role: true,
                updatedAt: true,
            },
        });

        return ResponseUtil.success(
            updatedUser,
            `用户 ${targetUser.name}(${targetUser.user}) 已提升为管理员`
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('提升用户权限失败', error as Error);
    }
}
