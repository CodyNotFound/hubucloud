import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return ResponseUtil.clientError('用户ID不能为空');
        }

        const adminCount = await db.user.count({ where: { role: 'ADMIN' } });

        if (adminCount > 0) {
            return ResponseUtil.clientError('系统已存在管理员，不能重复初始化', 400);
        }

        const targetUser = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                user: true,
                name: true,
                role: true,
            },
        });

        if (!targetUser) {
            return ResponseUtil.clientError('用户不存在', 404);
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
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
            `用户 ${targetUser.name}(${targetUser.user}) 已设置为系统第一个管理员`
        );
    } catch (error) {
        return ResponseUtil.serverError('初始化管理员失败', error as Error);
    }
}
