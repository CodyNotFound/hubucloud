import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword');
        const type = searchParams.get('type');
        const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : null;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;

        console.log('🔍 后端查询参数:', { keyword, type, page, limit });

        // 餐饮类型列表
        const foodTypes = [
            'campusfood',
            'mainfood',
            'drinks',
            'nightmarket',
            'fruit',
            'dessert',
            'snacks',
        ];

        const where: any = {};

        // 强制只查询餐饮类型
        if (type && foodTypes.includes(type)) {
            where.type = type;
        } else {
            // 如果没有指定type或指定了无效type，查询所有餐饮类型
            where.type = {
                in: foodTypes,
            };
        }

        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { address: { contains: keyword, mode: 'insensitive' } },
                { locationDescription: { contains: keyword, mode: 'insensitive' } },
                { menuText: { contains: keyword, mode: 'insensitive' } },
            ];
        }

        console.log('🔍 数据库查询条件:', where);

        // 如果没有分页参数，返回所有数据
        if (page === null || limit === null) {
            const restaurants = await db.restaurant.findMany({
                where,
                orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
            });

            console.log(`📋 查询结果: 找到 ${restaurants.length} 个餐厅 (全部数据)`);

            return ResponseUtil.success({
                list: restaurants,
            });
        }

        // 有分页参数时，返回分页数据
        const skip = (page - 1) * limit;
        const total = await db.restaurant.count({ where });

        const restaurants = await db.restaurant.findMany({
            where,
            orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
            skip,
            take: limit,
        });

        console.log(`📋 查询结果: 找到 ${restaurants.length}/${total} 个餐厅 (第${page}页)`);

        return ResponseUtil.success({
            list: restaurants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
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
        return ResponseUtil.serverError('获取餐厅列表失败', error as Error);
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request);

        const body = await request.json();
        const {
            name,
            address,
            phone,
            description,
            type,
            cover,
            openTime,
            locationDescription,
            latitude,
            longitude,
            tags = [],
            preview = [],
            rating = 0,
            orderQrCode,
            orderLink,
            blackCardAccepted = false,
            menuText = '',
            menuImages = [],
        } = body;

        // 验证必填字段 - 只有名字是必须的
        if (!name) {
            return ResponseUtil.error('餐厅名称是必填字段', 400);
        }

        // 验证餐厅类型（仅限餐饮类型）
        const validTypes = [
            'campusfood',
            'mainfood',
            'drinks',
            'nightmarket',
            'fruit',
            'dessert',
            'snacks',
        ];
        const finalType = type || 'mainfood';
        if (!validTypes.includes(finalType)) {
            return ResponseUtil.error(
                `无效的餐厅类型: ${finalType}，有效类型为: ${validTypes.join(', ')}`,
                400
            );
        }

        const restaurant = await db.restaurant.create({
            data: {
                name,
                address: address || '',
                phone: phone || '',
                description: description || '',
                type: finalType, // 使用已验证的类型
                cover: cover || '',
                openTime: openTime || '',
                locationDescription: locationDescription || '',
                latitude: latitude || 30.5951, // 默认湖北大学坐标
                longitude: longitude || 114.4086,
                tags,
                preview,
                rating,
                orderQrCode,
                orderLink,
                blackCardAccepted,
                menuText,
                menuImages,
            },
        });

        return ResponseUtil.success(restaurant, '餐厅创建成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('创建餐厅失败', error as Error);
    }
}
