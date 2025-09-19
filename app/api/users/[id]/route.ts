import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil, ERROR_MESSAGES } from '@/lib/response';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const user = await db.user.findUnique({
            where: { id },
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
        });

        if (!user) {
            return ResponseUtil.clientError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        return ResponseUtil.success(user);
    } catch (error) {
        return ResponseUtil.serverError('获取用户信息失败', error as Error);
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const currentUser = await authenticateRequest(request);
        const body = await request.json();

        const existingUser = await db.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return ResponseUtil.clientError('用户不存在', 404);
        }

        let isAdmin = false;
        if (currentUser) {
            const adminUser = await db.user.findUnique({
                where: { id: currentUser.userId },
                select: { role: true },
            });
            isAdmin = adminUser?.role === 'ADMIN';
        }

        const isSelf = currentUser?.userId === id;

        if (!isAdmin && !isSelf) {
            return ResponseUtil.authError(ERROR_MESSAGES.FORBIDDEN, 403);
        }

        if (body.role && !isAdmin) {
            return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
        }

        const updateData: any = {};
        if (body.name !== undefined) {
            if (body.name.length < 2 || body.name.length > 50) {
                return ResponseUtil.clientError('姓名长度必须在2-50字符之间');
            }
            updateData.name = body.name;
        }
        if (body.avatar !== undefined) updateData.avatar = body.avatar;
        if (body.phone !== undefined) {
            if (body.phone.length !== 11) {
                return ResponseUtil.clientError('手机号必须为11位');
            }
            updateData.phone = body.phone;
        }
        if (body.major !== undefined) {
            if (body.major.length < 2 || body.major.length > 100) {
                return ResponseUtil.clientError('专业长度必须在2-100字符之间');
            }
            updateData.major = body.major;
        }
        if (body.grade !== undefined) updateData.grade = body.grade;
        if (body.role !== undefined && (body.role === 'USER' || body.role === 'ADMIN')) {
            updateData.role = body.role;
        }

        const updatedUser = await db.user.update({
            where: { id },
            data: updateData,
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
        });

        return ResponseUtil.success(updatedUser, '用户信息更新成功');
    } catch (error) {
        return ResponseUtil.serverError('更新用户信息失败', error as Error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const currentUser = await authenticateRequest(request);

        if (!currentUser) {
            return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
        }

        const adminUser = await db.user.findUnique({
            where: { id: currentUser.userId },
            select: { role: true },
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
        }

        const existingUser = await db.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return ResponseUtil.clientError('用户不存在', 404);
        }

        if (currentUser.userId === id) {
            return ResponseUtil.clientError('不能删除自己的账户', 400);
        }

        await db.user.delete({
            where: { id },
        });

        return ResponseUtil.success({ message: '用户删除成功' });
    } catch (error) {
        return ResponseUtil.serverError('删除用户失败', error as Error);
    }
}
