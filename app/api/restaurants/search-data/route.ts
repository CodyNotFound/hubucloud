import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

/**
 * 获取餐厅搜索数据（轻量级，用于客户端缓存和本地搜索）
 * GET /api/restaurants/search-data
 */
export async function GET(_request: NextRequest) {
    try {
        // 获取所有餐厅的搜索相关字段
        const restaurants = await db.restaurant.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                locationDescription: true,
                tags: true,
                menuText: true,
            },
            orderBy: {
                id: 'asc',
            },
        });

        return ResponseUtil.success({
            restaurants,
            total: restaurants.length,
            version: '1.0', // 数据版本号，用于客户端缓存管理
        });
    } catch (error) {
        return ResponseUtil.serverError('获取餐厅搜索数据失败', error as Error);
    }
}
