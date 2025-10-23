import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
        const role = searchParams.get('role');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role && (role === 'USER' || role === 'ADMIN')) {
            where.role = role;
        }

        const [users, total] = await Promise.all([
            db.user.findMany({
                where,
                skip,
                take: limit,
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
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.user.count({ where }),
        ]);

        return ResponseUtil.success({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
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
        return ResponseUtil.serverError('获取用户列表失败', error as Error);
    }
}
