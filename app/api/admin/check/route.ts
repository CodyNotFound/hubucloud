import { NextRequest } from 'next/server';

import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await requireAdmin(request);

        return ResponseUtil.success(
            {
                isAdmin: true,
                user: {
                    id: currentUser.userId,
                    username: currentUser.username,
                    role: currentUser.role,
                },
            },
            '管理员权限验证通过'
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
        return ResponseUtil.serverError('管理员权限检查失败', error as Error);
    }
}
