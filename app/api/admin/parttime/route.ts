import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const keyword = searchParams.get('keyword');
        const type = searchParams.get('type');

        const skip = (page - 1) * limit;

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
                take: limit,
                orderBy: [
                    { updatedAt: 'desc' },
                    { id: 'asc' }, // 添加唯一标识符作为第二排序字段，确保分页稳定性
                ],
            }),
            db.parttime.count({ where }),
        ]);

        return ResponseUtil.success({
            list: parttime,
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
        return ResponseUtil.serverError('获取兼职列表失败', error as Error);
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request);

        const body = await request.json();
        const { name, type, salary, worktime, location, description, contact, requirements } = body;

        // 验证必填字段
        if (!name || !type || !salary || !worktime || !location || !description || !contact) {
            return ResponseUtil.error('缺少必填字段', 400);
        }

        const parttime = await db.parttime.create({
            data: {
                name,
                salary,
                worktime,
                location,
                description,
                contact,
                requirements,
                type,
            },
        });

        return ResponseUtil.success(parttime, '兼职创建成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('创建兼职失败', error as Error);
    }
}
