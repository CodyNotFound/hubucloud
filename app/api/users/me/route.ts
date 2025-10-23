import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await requireAuth(request);

        const user = await db.user.findUnique({
            where: { id: currentUser.userId },
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
                createdAt: true,
            },
        });

        if (!user) {
            return ResponseUtil.clientError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        return ResponseUtil.success(user);
    } catch (error) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
        }
        return ResponseUtil.serverError('获取用户信息失败', error as Error);
    }
}
