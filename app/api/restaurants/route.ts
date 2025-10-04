import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
        const type = searchParams.get('type');
        const tags = searchParams.get('tags');
        const skip = (page - 1) * limit;

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

        const [restaurants, total] = await Promise.all([
            db.restaurant.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { rating: 'desc' },
                    { id: 'asc' }, // 添加唯一标识符作为第二排序字段，确保分页稳定性
                ],
            }),
            db.restaurant.count({ where }),
        ]);

        return ResponseUtil.success({
            restaurants,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return ResponseUtil.serverError('获取餐厅列表失败', error as Error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            address,
            phone,
            description,
            type,
            cover,
            tags = [],
            preview = [],
            openTime,
            rating,
            latitude = 30.5951,
            longitude = 114.4086,
        } = body;

        if (!name || name.length < 1 || name.length > 100) {
            return ResponseUtil.clientError('餐厅名称长度必须在1-100字符之间');
        }
        if (!address || address.length < 1 || address.length > 200) {
            return ResponseUtil.clientError('地址长度必须在1-200字符之间');
        }
        if (phone && (phone.length < 1 || phone.length > 20)) {
            return ResponseUtil.clientError('电话长度必须在1-20字符之间');
        }
        if (!description || description.length < 1 || description.length > 1000) {
            return ResponseUtil.clientError('描述长度必须在1-1000字符之间');
        }
        if (!type || type.length < 1 || type.length > 50) {
            return ResponseUtil.clientError('类型长度必须在1-50字符之间');
        }
        if (!cover) {
            return ResponseUtil.clientError('封面图片不能为空');
        }
        if (!openTime) {
            return ResponseUtil.clientError('营业时间不能为空');
        }
        if (rating < 1 || rating > 5) {
            return ResponseUtil.clientError('评分必须在1-5之间');
        }

        const restaurant = await db.restaurant.create({
            data: {
                name,
                address,
                phone,
                description,
                type,
                cover,
                tags,
                preview,
                openTime,
                rating,
                latitude,
                longitude,
            },
        });

        return ResponseUtil.success(restaurant, '餐厅创建成功');
    } catch (error) {
        return ResponseUtil.serverError('创建餐厅失败', error as Error);
    }
}
