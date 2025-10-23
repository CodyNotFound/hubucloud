import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const [totalUsers, totalAdmins, totalRestaurants, totalParttime] = await Promise.all([
            db.user.count(),
            db.user.count({ where: { role: 'ADMIN' } }),
            db.restaurant.count(),
            db.parttime.count(),
        ]);

        return ResponseUtil.success({
            stats: {
                totalUsers,
                totalAdmins,
                regularUsers: totalUsers - totalAdmins,
                totalRestaurants,
                totalParttime,
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
        return ResponseUtil.serverError('获取管理员统计数据失败', error as Error);
    }
}
