import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

/**
 * GET /api/activity
 * 获取启用的活动列表（公开接口）
 * 只返回已启用的活动
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const autoOpen = searchParams.get('autoOpen');
        const status = searchParams.get('status');

        const where: any = {
            enabled: true,
        };

        if (autoOpen !== null && autoOpen !== undefined) {
            where.autoOpen = autoOpen === 'true';
        }

        if (status) {
            where.status = status;
        }

        const activities = await db.activity.findMany({
            where,
            orderBy: [{ createdAt: 'desc' }],
        });

        return ResponseUtil.success(activities);
    } catch (error) {
        return ResponseUtil.serverError('获取活动列表失败', error as Error);
    }
}
