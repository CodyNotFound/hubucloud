import type { Context } from 'hono';

import { Controller } from '@/decorators/controller';
import { Get, Post, Put, Delete } from '@/decorators/http';
import { Body, Query, Param } from '@/decorators/params';
import { Required, Length, IsNumber } from '@/decorators/validation';
import { ResponseUtil } from '@/core/response';
import { db } from '@/utils/db';

/**
 * 餐厅介绍控制器
 * 提供餐厅信息的增删改查功能
 */
@Controller('/api/restaurants')
export class RestaurantController {
    /**
     * 获取所有餐厅列表
     * 支持分页和类型筛选
     */
    @Get('/')
    async getRestaurants(
        c: Context,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('tags') tags?: string
    ) {
        try {
            const pageNum = page ? Math.max(1, parseInt(page) || 1) : 1;
            const limitNum = limit ? Math.max(1, Math.min(100, parseInt(limit) || 10)) : 10;
            const skip = (pageNum - 1) * limitNum;

            // 构建查询条件
            const where: any = {};
            if (type) {
                where.type = type;
            }
            if (tags) {
                const tagArray = tags.split(',');
                where.tags = {
                    hasSome: tagArray,
                };
            }

            // 获取餐厅列表
            const restaurants = await db.restaurant.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: {
                    rating: 'desc',
                },
            });

            // 获取总数用于分页
            const total = await db.restaurant.count({ where });

            return ResponseUtil.success(c, {
                restaurants,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取餐厅列表失败', error as Error);
        }
    }

    /**
     * 搜索餐厅
     */
    @Get('/search')
    async searchRestaurants(
        c: Context,
        @Query('keyword') @Required() keyword: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        try {
            const pageNum = page ? Math.max(1, parseInt(page) || 1) : 1;
            const limitNum = limit ? Math.max(1, Math.min(100, parseInt(limit) || 10)) : 10;
            const skip = (pageNum - 1) * limitNum;

            const restaurants = await db.restaurant.findMany({
                where: {
                    OR: [
                        { name: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } },
                        { address: { contains: keyword, mode: 'insensitive' } },
                        { type: { contains: keyword, mode: 'insensitive' } },
                    ],
                },
                skip,
                take: limitNum,
                orderBy: {
                    rating: 'desc',
                },
            });

            const total = await db.restaurant.count({
                where: {
                    OR: [
                        { name: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } },
                        { address: { contains: keyword, mode: 'insensitive' } },
                        { type: { contains: keyword, mode: 'insensitive' } },
                    ],
                },
            });

            return ResponseUtil.success(c, {
                restaurants,
                keyword,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '搜索餐厅失败', error as Error);
        }
    }

    /**
     * 根据位置搜索附近餐厅
     */
    @Get('/nearby')
    async getNearbyRestaurants(
        c: Context,
        @Query('latitude') @Required() latitude: string,
        @Query('longitude') @Required() longitude: string,
        @Query('radius') radius?: string,
        @Query('limit') limit?: string
    ) {
        try {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const radiusKm = radius ? parseFloat(radius) : 5; // 默认5公里
            const limitNum = limit ? parseInt(limit) : 20;

            // 简单的距离计算（实际项目中可能需要更精确的地理位置计算）
            const restaurants = await db.restaurant.findMany({
                take: limitNum,
                orderBy: {
                    rating: 'desc',
                },
            });

            // 计算距离并筛选
            const nearbyRestaurants = restaurants
                .map((restaurant) => {
                    const distance = this.calculateDistance(
                        lat,
                        lng,
                        restaurant.latitude,
                        restaurant.longitude
                    );
                    return {
                        ...restaurant,
                        distance: parseFloat(distance.toFixed(2)),
                    };
                })
                .filter((restaurant) => restaurant.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance);

            return ResponseUtil.success(c, nearbyRestaurants);
        } catch (error) {
            return ResponseUtil.serverError(c, '搜索附近餐厅失败', error as Error);
        }
    }

    /**
     * 根据ID获取餐厅详情
     */
    @Get('/:id')
    async getRestaurantById(c: Context, @Param('id') @Required() id: string) {
        try {
            const restaurant = await db.restaurant.findUnique({
                where: { id },
            });

            if (!restaurant) {
                return ResponseUtil.clientError(c, '餐厅不存在', 404);
            }

            return ResponseUtil.success(c, restaurant);
        } catch (error) {
            return ResponseUtil.serverError(c, '获取餐厅详情失败', error as Error);
        }
    }

    /**
     * 创建新餐厅
     */
    @Post('/')
    async createRestaurant(
        c: Context,
        @Body('name') @Required() @Length(1, 100) name: string,
        @Body('address') @Required() @Length(1, 200) address: string,
        @Body('phone') @Required() @Length(1, 20) phone: string,
        @Body('description') @Required() @Length(1, 1000) description: string,
        @Body('type') @Required() @Length(1, 50) type: string,
        @Body('cover') @Required() cover: string,
        @Body('tags') tags: string[],
        @Body('preview') preview: string[],
        @Body('openTime') @Required() openTime: string,
        @Body('rating') @IsNumber(1, 5) rating: number,
        @Body('latitude') @Required() latitude: number,
        @Body('longitude') @Required() longitude: number
    ) {
        try {
            const restaurant = await db.restaurant.create({
                data: {
                    name,
                    address,
                    phone,
                    description,
                    type,
                    cover,
                    tags: tags || [],
                    preview: preview || [],
                    openTime,
                    rating,
                    latitude,
                    longitude,
                },
            });

            return ResponseUtil.success(c, restaurant);
        } catch (error) {
            return ResponseUtil.serverError(c, '创建餐厅失败', error as Error);
        }
    }

    /**
     * 更新餐厅信息
     */
    @Put('/:id')
    async updateRestaurant(
        c: Context,
        @Param('id') @Required() id: string,
        @Body('name') @Length(1, 100) name?: string,
        @Body('address') @Length(1, 200) address?: string,
        @Body('phone') @Length(1, 20) phone?: string,
        @Body('description') @Length(1, 1000) description?: string,
        @Body('type') @Length(1, 50) type?: string,
        @Body('cover') cover?: string,
        @Body('tags') tags?: string[],
        @Body('preview') preview?: string[],
        @Body('openTime') openTime?: string,
        @Body('rating') @IsNumber(1, 5) rating?: number,
        @Body('latitude') latitude?: number,
        @Body('longitude') longitude?: number
    ) {
        try {
            // 检查餐厅是否存在
            const existingRestaurant = await db.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                return ResponseUtil.clientError(c, '餐厅不存在', 404);
            }

            // 构建更新数据对象
            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (address !== undefined) updateData.address = address;
            if (phone !== undefined) updateData.phone = phone;
            if (description !== undefined) updateData.description = description;
            if (type !== undefined) updateData.type = type;
            if (cover !== undefined) updateData.cover = cover;
            if (tags !== undefined) updateData.tags = tags;
            if (preview !== undefined) updateData.preview = preview;
            if (openTime !== undefined) updateData.openTime = openTime;
            if (rating !== undefined) updateData.rating = rating;
            if (latitude !== undefined) updateData.latitude = latitude;
            if (longitude !== undefined) updateData.longitude = longitude;

            const restaurant = await db.restaurant.update({
                where: { id },
                data: updateData,
            });

            return ResponseUtil.success(c, restaurant);
        } catch (error) {
            return ResponseUtil.serverError(c, '更新餐厅信息失败', error as Error);
        }
    }

    /**
     * 删除餐厅
     */
    @Delete('/:id')
    async deleteRestaurant(c: Context, @Param('id') @Required() id: string) {
        try {
            // 检查餐厅是否存在
            const existingRestaurant = await db.restaurant.findUnique({
                where: { id },
            });

            if (!existingRestaurant) {
                return ResponseUtil.clientError(c, '餐厅不存在', 404);
            }

            await db.restaurant.delete({
                where: { id },
            });

            return ResponseUtil.success(c, { message: '餐厅删除成功' });
        } catch (error) {
            return ResponseUtil.serverError(c, '删除餐厅失败', error as Error);
        }
    }

    /**
     * 计算两点间距离（单位：公里）
     * 使用Haversine公式
     */
    private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371; // 地球半径（公里）
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
