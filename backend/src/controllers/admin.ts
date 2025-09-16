import type { Context } from 'hono';

import { Controller } from '@/decorators/controller';
import { Get, Post, Put, Delete } from '@/decorators/http';
import { Body, Query, Param } from '@/decorators/params';
import { Required } from '@/decorators/validation';
import { RequireAdmin, getCurrentUser } from '@/decorators/auth';
import { ResponseUtil } from '@/core/response';
import { db } from '@/utils/db';

/**
 * 管理员控制器
 * 提供管理员权限检查和相关功能
 */
@Controller('/api/admin')
export class AdminController {
    /**
     * 检查用户是否为管理员
     * 基于JWT token验证管理员权限
     */
    @Get('/check')
    @RequireAdmin()
    async checkAdminRole(c: Context) {
        try {
            const currentUser = getCurrentUser(c);

            // 管理员权限验证通过
            return ResponseUtil.success(
                c,
                {
                    isAdmin: true,
                    user: {
                        id: currentUser!.userId,
                        username: currentUser!.username,
                        role: currentUser!.role,
                    },
                },
                '管理员权限验证通过'
            );
        } catch (error) {
            return ResponseUtil.serverError(c, '管理员权限检查失败', error as Error);
        }
    }

    /**
     * 初始化第一个管理员（仅当系统没有管理员时可用）
     */
    @Post('/init-admin')
    async initFirstAdmin(c: Context, @Body('userId') @Required() userId: string) {
        try {
            // 检查系统是否已经有管理员
            const adminCount = await db.user.count({ where: { role: 'ADMIN' } });

            if (adminCount > 0) {
                return ResponseUtil.clientError(c, '系统已存在管理员，不能重复初始化', 400);
            }

            // 检查目标用户是否存在
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
                return ResponseUtil.clientError(c, '用户不存在', 404);
            }

            // 提升为管理员
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
                c,
                updatedUser,
                `用户 ${targetUser.name}(${targetUser.user}) 已设置为系统第一个管理员`
            );
        } catch (error) {
            return ResponseUtil.serverError(c, '初始化管理员失败', error as Error);
        }
    }

    /**
     * 获取管理员信息统计
     * 仅管理员可访问
     */
    @Get('/stats')
    @RequireAdmin()
    async getAdminStats(c: Context) {
        try {
            // 获取统计数据
            const [totalUsers, totalAdmins, totalRestaurants, totalParttime] = await Promise.all([
                db.user.count(),
                db.user.count({ where: { role: 'ADMIN' } }),
                db.restaurant.count(),
                db.parttime.count(),
            ]);

            return ResponseUtil.success(c, {
                stats: {
                    totalUsers,
                    totalAdmins,
                    regularUsers: totalUsers - totalAdmins,
                    totalRestaurants,
                    totalParttime,
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取管理员统计数据失败', error as Error);
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

    /**
     * 提升用户为管理员（需要管理员权限）
     */
    @Post('/promote-user')
    @RequireAdmin()
    async promoteUser(c: Context, @Body('targetUserId') @Required() targetUserId: string) {
        try {
            const currentUser = getCurrentUser(c);

            // 检查目标用户是否存在
            const targetUser = await db.user.findUnique({
                where: { id: targetUserId },
                select: {
                    id: true,
                    user: true,
                    name: true,
                    role: true,
                },
            });

            if (!targetUser) {
                return ResponseUtil.clientError(c, '目标用户不存在', 404);
            }

            // 如果用户已经是管理员
            if (targetUser.role === 'ADMIN') {
                return ResponseUtil.clientError(c, '用户已经是管理员', 400);
            }

            // 提升用户为管理员
            const updatedUser = await db.user.update({
                where: { id: targetUserId },
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
                c,
                updatedUser,
                `用户 ${targetUser.name}(${targetUser.user}) 已提升为管理员`
            );
        } catch (error) {
            return ResponseUtil.serverError(c, '提升用户权限失败', error as Error);
        }
    }

    /**
     * 撤销用户的管理员权限（需要管理员权限）
     */
    @Post('/demote-admin')
    @RequireAdmin()
    async demoteAdmin(c: Context, @Body('targetUserId') @Required() targetUserId: string) {
        try {
            const currentUser = getCurrentUser(c);

            // 不能撤销自己的管理员权限
            if (currentUser!.userId === targetUserId) {
                return ResponseUtil.clientError(c, '不能撤销自己的管理员权限', 400);
            }

            // 检查目标用户是否存在
            const targetUser = await db.user.findUnique({
                where: { id: targetUserId },
                select: {
                    id: true,
                    user: true,
                    name: true,
                    role: true,
                },
            });

            if (!targetUser) {
                return ResponseUtil.clientError(c, '目标用户不存在', 404);
            }

            // 如果用户已经是普通用户
            if (targetUser.role === 'USER') {
                return ResponseUtil.clientError(c, '用户已经是普通用户', 400);
            }

            // 撤销管理员权限
            const updatedUser = await db.user.update({
                where: { id: targetUserId },
                data: { role: 'USER' },
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
                c,
                updatedUser,
                `管理员 ${targetUser.name}(${targetUser.user}) 已撤销为普通用户`
            );
        } catch (error) {
            return ResponseUtil.serverError(c, '撤销管理员权限失败', error as Error);
        }
    }

    // ============ 兼职管理相关接口 ============

    /**
     * 获取兼职列表（管理员）
     */
    @Get('/parttime')
    @RequireAdmin()
    async getParttimeList(
        c: Context,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('keyword') keyword?: string,
        @Query('type') type?: string
    ) {
        try {
            const pageNum = parseInt(page || '1');
            const limitNum = parseInt(limit || '10');
            const skip = (pageNum - 1) * limitNum;

            const where: any = {};
            if (keyword) {
                where.OR = [
                    { name: { contains: keyword } },
                    { description: { contains: keyword } },
                    { location: { contains: keyword } },
                ];
            }
            if (type) {
                where.type = type;
            }

            const [parttime, total] = await Promise.all([
                db.parttime.findMany({
                    where,
                    skip,
                    take: limitNum,
                    orderBy: { updatedAt: 'desc' },
                }),
                db.parttime.count({ where }),
            ]);

            return ResponseUtil.success(c, {
                list: parttime,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取兼职列表失败', error as Error);
        }
    }

    /**
     * 创建兼职（管理员）
     */
    @Post('/parttime')
    @RequireAdmin()
    async createParttime(
        c: Context,
        @Body('name') @Required() name: string,
        @Body('salary') @Required() salary: string,
        @Body('worktime') @Required() worktime: string,
        @Body('location') @Required() location: string,
        @Body('description') @Required() description: string,
        @Body('contact') @Required() contact: string,
        @Body('requirements') requirements?: string,
        @Body('tags') tags?: string[]
    ) {
        try {
            const parttime = await db.parttime.create({
                data: {
                    name,
                    salary,
                    worktime,
                    location,
                    description,
                    contact,
                    requirements,
                    tags: tags || [],
                },
            });

            return ResponseUtil.success(c, parttime, '兼职创建成功');
        } catch (error) {
            return ResponseUtil.serverError(c, '创建兼职失败', error as Error);
        }
    }

    /**
     * 更新兼职信息（管理员）
     */
    @Put('/parttime/:id')
    @RequireAdmin()
    async updateParttime(
        c: Context,
        @Param('id') id: string,
        @Body('name') name?: string,
        @Body('salary') salary?: string,
        @Body('worktime') worktime?: string,
        @Body('location') location?: string,
        @Body('description') description?: string,
        @Body('contact') contact?: string,
        @Body('requirements') requirements?: string,
        @Body('tags') tags?: string[]
    ) {
        try {
            const existingParttime = await db.parttime.findUnique({
                where: { id },
            });

            if (!existingParttime) {
                return ResponseUtil.clientError(c, '兼职不存在', 404);
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (salary !== undefined) updateData.salary = salary;
            if (worktime !== undefined) updateData.worktime = worktime;
            if (location !== undefined) updateData.location = location;
            if (description !== undefined) updateData.description = description;
            if (contact !== undefined) updateData.contact = contact;
            if (requirements !== undefined) updateData.requirements = requirements;
            if (tags !== undefined) updateData.tags = tags;

            const updatedParttime = await db.parttime.update({
                where: { id },
                data: updateData,
            });

            return ResponseUtil.success(c, updatedParttime, '兼职信息更新成功');
        } catch (error) {
            return ResponseUtil.serverError(c, '更新兼职失败', error as Error);
        }
    }

    /**
     * 删除兼职（管理员）
     */
    @Delete('/parttime/:id')
    @RequireAdmin()
    async deleteParttime(c: Context, @Param('id') id: string) {
        try {
            const existingParttime = await db.parttime.findUnique({
                where: { id },
            });

            if (!existingParttime) {
                return ResponseUtil.clientError(c, '兼职不存在', 404);
            }

            await db.parttime.delete({
                where: { id },
            });

            return ResponseUtil.success(c, null, '兼职删除成功');
        } catch (error) {
            return ResponseUtil.serverError(c, '删除兼职失败', error as Error);
        }
    }

    // ============ 餐厅管理相关接口 ============

    /**
     * 获取餐厅列表（管理员）
     */
    @Get('/restaurant')
    @RequireAdmin()
    async getRestaurantList(
        c: Context,
        @Query('keyword') keyword?: string,
        @Query('type') type?: string
    ) {
        try {
            const where: any = {};
            if (keyword) {
                where.OR = [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { description: { contains: keyword, mode: 'insensitive' } },
                    { address: { contains: keyword, mode: 'insensitive' } },
                    { locationDescription: { contains: keyword, mode: 'insensitive' } },
                ];
            }
            if (type) {
                where.type = type;
            }

            const restaurants = await db.restaurant.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
            });

            return ResponseUtil.success(c, {
                list: restaurants,
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取餐厅列表失败', error as Error);
        }
    }

    /**
     * 创建餐厅（管理员）
     */
    @Post('/restaurant')
    @RequireAdmin()
    async createRestaurant(
        c: Context,
        @Body('name') @Required() name: string,
        @Body('address') @Required() address: string,
        @Body('phone') @Required() phone: string,
        @Body('description') @Required() description: string,
        @Body('type') @Required() type: string,
        @Body('cover') cover: string,
        @Body('openTime') @Required() openTime: string,
        @Body('locationDescription') @Required() locationDescription: string,
        @Body('latitude') latitude?: number,
        @Body('longitude') longitude?: number,
        @Body('tags') tags?: string[],
        @Body('preview') preview?: string[],
        @Body('rating') rating?: number
    ) {
        try {
            const restaurant = await db.restaurant.create({
                data: {
                    name,
                    address,
                    phone,
                    description,
                    type,
                    cover: cover || '',
                    openTime,
                    locationDescription,
                    latitude: latitude || 30.5951, // 默认湖北大学坐标
                    longitude: longitude || 114.4086,
                    tags: tags || [],
                    preview: preview || [],
                    rating: rating || 0,
                },
            });

            return ResponseUtil.success(c, restaurant, '餐厅创建成功');
        } catch (error) {
            return ResponseUtil.serverError(c, '创建餐厅失败', error as Error);
        }
    }

    /**
     * 更新餐厅信息（管理员）
     */
    @Put('/restaurant/:id')
    @RequireAdmin()
    async updateRestaurant(
        c: Context,
        @Param('id') id: string,
        @Body('name') name?: string,
        @Body('address') address?: string,
        @Body('phone') phone?: string,
        @Body('description') description?: string,
        @Body('type') type?: string,
        @Body('cover') cover?: string,
        @Body('openTime') openTime?: string,
        @Body('locationDescription') locationDescription?: string,
        @Body('latitude') latitude?: number,
        @Body('longitude') longitude?: number,
        @Body('tags') tags?: string[],
        @Body('preview') preview?: string[],
        @Body('rating') rating?: number
    ) {
        try {
            const existingRestaurant = await db.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                return ResponseUtil.clientError(c, '餐厅不存在', 404);
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (address !== undefined) updateData.address = address;
            if (phone !== undefined) updateData.phone = phone;
            if (description !== undefined) updateData.description = description;
            if (type !== undefined) updateData.type = type;
            if (cover !== undefined) updateData.cover = cover;
            if (openTime !== undefined) updateData.openTime = openTime;
            if (locationDescription !== undefined)
                updateData.locationDescription = locationDescription;
            if (latitude !== undefined) updateData.latitude = latitude;
            if (longitude !== undefined) updateData.longitude = longitude;
            if (tags !== undefined) updateData.tags = tags;
            if (preview !== undefined) updateData.preview = preview;
            if (rating !== undefined) updateData.rating = rating;

            const updatedRestaurant = await db.restaurant.update({
                where: { id },
                data: updateData,
            });

            return ResponseUtil.success(c, updatedRestaurant, '餐厅信息更新成功');
        } catch (error) {
            return ResponseUtil.serverError(c, '更新餐厅失败', error as Error);
        }
    }

    /**
     * 删除餐厅（管理员）
     */
    @Delete('/restaurant/:id')
    @RequireAdmin()
    async deleteRestaurant(c: Context, @Param('id') id: string) {
        try {
            const existingRestaurant = await db.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                return ResponseUtil.clientError(c, '餐厅不存在', 404);
            }

            await db.restaurant.delete({
                where: { id },
            });

            return ResponseUtil.success(c, null, '餐厅删除成功');
        } catch (error) {
            return ResponseUtil.serverError(c, '删除餐厅失败', error as Error);
        }
    }
}
