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
                { location: { contains: keyword, mode: 'insensitive' as const } },
                { type: { contains: keyword, mode: 'insensitive' as const } },
            ],
        };

        const [parttimes, total] = await Promise.all([
            db.parttime.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.parttime.count({ where }),
        ]);

        return ResponseUtil.success({
            parttimes,
            keyword,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return ResponseUtil.serverError('搜索兼职失败', error as Error);
    }
}
