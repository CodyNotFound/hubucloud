import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

/**
 * 判断当前时间是否在美食口令开放时间内（21:50-24:00）
 */
function isPasswordAvailable(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 21:50 到 23:59 之间
    if (hours === 21 && minutes >= 50) {
        return true;
    }
    if (hours === 22 || hours === 23) {
        return true;
    }

    return false;
}

/**
 * GET /api/food-password
 * 获取美食口令（公开接口）
 * 仅在每天 21:50-24:00 期间返回口令
 */
export async function GET(request: NextRequest) {
    try {
        const isAvailable = isPasswordAvailable();
        const passwordKey = 'food_password';

        // 查询美食口令配置
        const config = await db.config.findUnique({
            where: { key: passwordKey },
        });

        if (!isAvailable) {
            // 不在开放时间
            return ResponseUtil.success({
                available: false,
                password: null,
                message: '美食口令每天 21:50 开放',
            });
        }

        // 在开放时间内
        if (!config || !config.value) {
            // 管理员尚未设置今日口令
            return ResponseUtil.success({
                available: true,
                password: null,
                message: '今日口令尚未设置',
            });
        }

        return ResponseUtil.success({
            available: true,
            password: config.value,
            message: '今日美食口令',
            description: config.description,
        });
    } catch (error) {
        return ResponseUtil.serverError('获取美食口令失败', error as Error);
    }
}
