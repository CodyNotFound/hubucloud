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

        console.log('🔍 后端查询参数:', { keyword, type });

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

        console.log('🔍 数据库查询条件:', where);

        const restaurants = await db.restaurant.findMany({
            where,
            orderBy: [
                { updatedAt: 'desc' },
                { id: 'asc' }, // 添加唯一标识符确保排序稳定性
            ],
        });

        console.log(`📋 查询结果: 找到 ${restaurants.length} 个餐厅`);
        if (restaurants.length > 0) {
            console.log(
                '前3个餐厅:',
                restaurants.slice(0, 3).map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: r.type,
                }))
            );
        }

        return ResponseUtil.success({
            list: restaurants,
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
        } = body;

        // 验证必填字段 - 只有名字是必须的
        if (!name) {
            return ResponseUtil.error('餐厅名称是必填字段', 400);
        }

        // 验证餐厅类型
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
