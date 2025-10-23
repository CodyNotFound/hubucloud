import { createHash } from 'crypto';

import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { JWTUtil } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user: username, password } = body;

        if (!username || !password) {
            return ResponseUtil.clientError('用户名和密码不能为空');
        }

        const user = await db.user.findUnique({
            where: { user: username },
        });

        if (!user) {
            return ResponseUtil.authError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const hashedPassword = createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedPassword) {
            return ResponseUtil.authError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const token = JWTUtil.generateToken({
            userId: user.id,
            username: user.user,
            role: user.role,
        });

        const userInfo = {
            id: user.id,
            user: user.user,
            name: user.name,
            avatar: user.avatar,
            phone: user.phone,
            studentId: user.studentId,
            major: user.major,
            grade: user.grade,
            role: user.role,
            createdAt: user.createdAt,
        };

        return ResponseUtil.success(
            {
                user: userInfo,
                token,
                expiresIn: '7d',
            },
            '登录成功'
        );
    } catch (error) {
        return ResponseUtil.serverError('登录失败', error as Error);
    }
}
