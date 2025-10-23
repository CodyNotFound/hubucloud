import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { validateContact, validateRequirements } from '@/lib/parttime';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
        const type = searchParams.get('type');
        const location = searchParams.get('location');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type) {
            where.type = type;
        }
        if (location) {
            where.location = {
                contains: location,
                mode: 'insensitive' as const,
            };
        }

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, type, salary, worktime, location, description, contact, requirements } = body;

        if (!name || name.length < 1 || name.length > 100) {
            return ResponseUtil.clientError('兼职名称长度必须在1-100字符之间');
        }
        if (!type || type.length < 1 || type.length > 50) {
            return ResponseUtil.clientError('兼职类型长度必须在1-50字符之间');
        }
        if (!salary || salary.length < 1 || salary.length > 100) {
            return ResponseUtil.clientError('薪资信息长度必须在1-100字符之间');
        }
        if (!worktime || worktime.length < 1 || worktime.length > 200) {
            return ResponseUtil.clientError('工作时间长度必须在1-200字符之间');
        }
        if (!location || location.length < 1 || location.length > 200) {
            return ResponseUtil.clientError('工作地点长度必须在1-200字符之间');
        }
        if (!description || description.length < 1 || description.length > 2000) {
            return ResponseUtil.clientError('工作描述长度必须在1-2000字符之间');
        }
        if (!contact) {
            return ResponseUtil.clientError('联系方式不能为空');
        }

        const contactValidation = validateContact(contact);
        if (!contactValidation.isValid) {
            return ResponseUtil.clientError(contactValidation.error || '联系方式格式不正确', 400);
        }

        if (requirements) {
            const requirementsValidation = validateRequirements(requirements);
            if (!requirementsValidation.isValid) {
                return ResponseUtil.clientError(
                    requirementsValidation.error || '要求字段格式不正确',
                    400
                );
            }
        }

        const parttime = await db.parttime.create({
            data: {
                name,
                type,
                salary,
                worktime,
                location,
                description,
                contact,
                requirements: requirements || null,
            },
        });

        return ResponseUtil.success(parttime, '兼职发布成功');
    } catch (error) {
        return ResponseUtil.serverError('发布兼职失败', error as Error);
    }
}
