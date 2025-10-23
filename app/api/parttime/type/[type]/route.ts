import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    try {
        const { type } = await params;
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
        const skip = (page - 1) * limit;

        const [parttimes, total] = await Promise.all([
            db.parttime.findMany({
                where: { type },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            db.parttime.count({
                where: { type },
            }),
        ]);

        return ResponseUtil.success({
            parttimes,
            type,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return ResponseUtil.serverError('获取兼职列表失败', error as Error);
    }
}
