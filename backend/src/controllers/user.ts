import type { Context } from 'hono';

import { createHash } from 'crypto';

import { Controller } from '@/decorators/controller';
import { Get, Post, Put, Delete } from '@/decorators/http';
import { Body, Query, Param, Header } from '@/decorators/params';
import { Required, Length } from '@/decorators/validation';
import { RequireAuth, getCurrentUser } from '@/decorators/auth';
import { ResponseUtil } from '@/core/response';
import { db } from '@/utils/db';
import { JWTUtil } from '@/utils/jwt';

/**
 * 用户控制器
 * 提供用户注册、登录、信息管理功能
 */
@Controller('/api/users')
export class UserController {
    /**
     * 用户注册
     */
    @Post('/register')
    async register(
        c: Context,
        @Body('user') @Required() @Length(3, 30) username: string,
        @Body('password') @Required() @Length(6, 50) password: string
    ) {
        try {
            // 检查用户名是否已存在
            const existingUser = await db.user.findUnique({
                where: { user: username },
            });

            if (existingUser) {
                return ResponseUtil.clientError(c, '用户名已存在', 400);
            }

            // 密码加密（简单实现，实际项目中建议使用bcrypt）
            const hashedPassword = createHash('sha256').update(password).digest('hex');

            // 普通用户注册只能是USER角色，管理员角色需要特殊权限
            const userRole = 'USER';

            // 创建用户，其他字段设置为默认值
            const newUser = await db.user.create({
                data: {
                    user: username,
                    password: hashedPassword,
                    name: username, // 默认使用用户名作为姓名
                    avatar: '/public/avatar.webp',
                    phone: '未设置',
                    studentId: `temp_${Date.now()}`,
                    major: '未设置',
                    grade: -1,
                    role: userRole,
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

            // 生成JWT token
            const token = JWTUtil.generateToken({
                userId: newUser.id,
                username: newUser.user,
                role: newUser.role,
            });

            return ResponseUtil.success(c, {
                user: newUser,
                token,
                expiresIn: '7d',
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '用户注册失败', error as Error);
        }
    }

    /**
     * 用户登录
     */
    @Post('/login')
    async login(
        c: Context,
        @Body('user') @Required() username: string,
        @Body('password') @Required() password: string
    ) {
        try {
            // 查找用户
            const user = await db.user.findUnique({
                where: { user: username },
            });

            if (!user) {
                return ResponseUtil.clientError(c, '用户名或密码错误', 401);
            }

            // 验证密码
            const hashedPassword = createHash('sha256').update(password).digest('hex');
            if (user.password !== hashedPassword) {
                return ResponseUtil.clientError(c, '用户名或密码错误', 401);
            }

            // 生成JWT token
            const token = JWTUtil.generateToken({
                userId: user.id,
                username: user.user,
                role: user.role,
            });

            // 返回用户信息（不包含密码）和token
            const userInfo = {
                id: user.id,
                username: user.user,
                name: user.name,
                avatar: user.avatar,
                phone: user.phone,
                studentId: user.studentId,
                major: user.major,
                grade: user.grade,
                role: user.role,
                createdAt: user.createdAt,
            };

            return ResponseUtil.success(c, {
                user: userInfo,
                token,
                expiresIn: '7d',
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '登录失败', error as Error);
        }
    }

    /**
     * 获取当前用户信息 (需要认证)
     */
    @Get('/me')
    @RequireAuth()
    async getCurrentUserInfo(c: Context) {
        try {
            const currentUser = getCurrentUser(c);
            if (!currentUser) {
                return ResponseUtil.authError(c, '未登录', 401);
            }

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
                return ResponseUtil.clientError(c, '用户不存在', 404);
            }

            return ResponseUtil.success(c, user);
        } catch (error) {
            return ResponseUtil.serverError(c, '获取用户信息失败', error as Error);
        }
    }

    /**
     * 获取用户信息
     */
    @Get('/:id')
    async getUserById(c: Context, @Param('id') @Required() id: string) {
        try {
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
                return ResponseUtil.clientError(c, '用户不存在', 404);
            }

            return ResponseUtil.success(c, user);
        } catch (error) {
            return ResponseUtil.serverError(c, '获取用户信息失败', error as Error);
        }
    }

    /**
     * 获取所有用户列表（管理员权限）
     */
    @Get('/')
    async getUsers(
        c: Context,
        @Header('user-id') userId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('role') role?: string
    ) {
        try {
            // 检查管理员权限
            const adminCheck = await this.checkAdminPermission(userId);
            if (!adminCheck.isAdmin) {
                return ResponseUtil.clientError(c, adminCheck.message, adminCheck.statusCode);
            }

            const pageNum = page ? Math.max(1, parseInt(page) || 1) : 1;
            const limitNum = limit ? Math.max(1, Math.min(100, parseInt(limit) || 10)) : 10;
            const skip = (pageNum - 1) * limitNum;

            // 构建查询条件
            const where: any = {};
            if (role && (role === 'USER' || role === 'ADMIN')) {
                where.role = role;
            }

            // 获取用户列表
            const users = await db.user.findMany({
                where,
                skip,
                take: limitNum,
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
            });

            // 获取总数用于分页
            const total = await db.user.count({ where });

            return ResponseUtil.success(c, {
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取用户列表失败', error as Error);
        }
    }

    /**
     * 更新用户信息
     */
    @Put('/:id')
    async updateUser(
        c: Context,
        @Param('id') @Required() id: string,
        @Header('user-id') currentUserId?: string,
        @Body('name') @Length(2, 50) name?: string,
        @Body('avatar') avatar?: string,
        @Body('phone') @Length(11, 11) phone?: string,
        @Body('major') @Length(2, 100) major?: string,
        @Body('grade') grade?: number,
        @Body('role') role?: string
    ) {
        try {
            // 检查用户是否存在
            const existingUser = await db.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                return ResponseUtil.clientError(c, '用户不存在', 404);
            }

            // 权限检查：只有管理员或用户本人可以修改用户信息
            let isAdmin = false;
            if (currentUserId) {
                const adminCheck = await this.checkAdminPermission(currentUserId);
                isAdmin = adminCheck.isAdmin;
            }
            const isSelf = currentUserId === id;

            if (!isAdmin && !isSelf) {
                return ResponseUtil.clientError(c, '权限不足', 403);
            }

            // 如果要修改角色，只有管理员可以操作
            if (role && !isAdmin) {
                return ResponseUtil.clientError(c, '只有管理员可以修改用户角色', 403);
            }

            // 构建更新数据对象
            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (avatar !== undefined) updateData.avatar = avatar;
            if (phone !== undefined) updateData.phone = phone;
            if (major !== undefined) updateData.major = major;
            if (grade !== undefined) updateData.grade = grade;
            if (role !== undefined && (role === 'USER' || role === 'ADMIN')) {
                updateData.role = role;
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

            return ResponseUtil.success(c, updatedUser);
        } catch (error) {
            return ResponseUtil.serverError(c, '更新用户信息失败', error as Error);
        }
    }

    /**
     * 删除用户（管理员权限）
     */
    @Delete('/:id')
    async deleteUser(
        c: Context,
        @Param('id') @Required() id: string,
        @Header('user-id') currentUserId?: string
    ) {
        try {
            // 检查管理员权限
            const adminCheck = await this.checkAdminPermission(currentUserId);
            if (!adminCheck.isAdmin) {
                return ResponseUtil.clientError(c, adminCheck.message, adminCheck.statusCode);
            }

            // 检查用户是否存在
            const existingUser = await db.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                return ResponseUtil.clientError(c, '用户不存在', 404);
            }

            // 防止删除自己
            if (currentUserId === id) {
                return ResponseUtil.clientError(c, '不能删除自己的账户', 400);
            }

            await db.user.delete({
                where: { id },
            });

            return ResponseUtil.success(c, { message: '用户删除成功' });
        } catch (error) {
            return ResponseUtil.serverError(c, '删除用户失败', error as Error);
        }
    }

    /**
     * 私有方法：检查管理员权限
     */
    private async checkAdminPermission(userId?: string): Promise<{
        isAdmin: boolean;
        message: string;
        statusCode: number;
        user?: any;
    }> {
        // 检查是否提供了用户ID
        if (!userId) {
            return {
                isAdmin: false,
                message: '未登录',
                statusCode: 401,
            };
        }

        // 查询用户信息
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                user: true,
                name: true,
                role: true,
            },
        });

        // 用户不存在
        if (!user) {
            return {
                isAdmin: false,
                message: '未登录',
                statusCode: 401,
            };
        }

        // 检查是否为管理员
        if (user.role !== 'ADMIN') {
            return {
                isAdmin: false,
                message: '权限不足，需要管理员权限',
                statusCode: 403,
            };
        }

        return {
            isAdmin: true,
            message: '管理员权限验证通过',
            statusCode: 200,
            user,
        };
    }
}
