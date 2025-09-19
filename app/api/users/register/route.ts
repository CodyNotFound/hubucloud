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

        if (username.length < 3 || username.length > 30) {
            return ResponseUtil.clientError('用户名长度必须在3-30字符之间');
        }

        if (password.length < 6 || password.length > 50) {
            return ResponseUtil.clientError('密码长度必须在6-50字符之间');
        }

        const existingUser = await db.user.findUnique({
            where: { user: username },
        });

        if (existingUser) {
            return ResponseUtil.clientError(ERROR_MESSAGES.USERNAME_EXISTS, 400);
        }

        const hashedPassword = createHash('sha256').update(password).digest('hex');

        const newUser = await db.user.create({
            data: {
                user: username,
                password: hashedPassword,
                name: username,
                avatar: '/logo.png',
                phone: '未设置',
                studentId: `temp_${Date.now()}`,
                major: '未设置',
                grade: -1,
                role: 'USER',
            },
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

        const token = JWTUtil.generateToken({
            userId: newUser.id,
            username: newUser.user,
            role: newUser.role,
        });

        return ResponseUtil.success(
            {
                user: newUser,
                token,
                expiresIn: '7d',
            },
            '注册成功'
        );
    } catch (error) {
        return ResponseUtil.serverError('用户注册失败', error as Error);
    }
}
