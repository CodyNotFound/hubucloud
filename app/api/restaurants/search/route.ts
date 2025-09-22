import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
        const skip = (page - 1) * limit;

        if (!keyword) {
            return ResponseUtil.clientError('搜索关键词不能为空');
        }

        const where = {
            OR: [
                { name: { contains: keyword, mode: 'insensitive' as const } },
                { description: { contains: keyword, mode: 'insensitive' as const } },
                { address: { contains: keyword, mode: 'insensitive' as const } },
                { type: { contains: keyword, mode: 'insensitive' as const } },
            ],
        };

        const [restaurants, total] = await Promise.all([
            db.restaurant.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    rating: 'desc',
                },
            }),
            db.restaurant.count({ where })
        ]);

        return ResponseUtil.success({
            restaurants,
            keyword,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return ResponseUtil.serverError('搜索餐厅失败', error as Error);
    }
}