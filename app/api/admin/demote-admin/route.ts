import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await requireAdmin(request);

        const body = await request.json();
        const { targetUserId } = body;

        if (!targetUserId) {
            return ResponseUtil.clientError('目标用户ID不能为空');
        }

        if (currentUser.userId === targetUserId) {
            return ResponseUtil.clientError('不能撤销自己的管理员权限', 400);
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

        if (targetUser.role === 'USER') {
            return ResponseUtil.clientError('用户已经是普通用户', 400);
        }

        const updatedUser = await db.user.update({
            where: { id: targetUserId },
            data: { role: 'USER' },
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
            `管理员 ${targetUser.name}(${targetUser.user}) 已撤销为普通用户`
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
        return ResponseUtil.serverError('撤销管理员权限失败', error as Error);
    }
}
