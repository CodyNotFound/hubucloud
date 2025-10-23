import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { validateContact, validateRequirements } from '@/lib/parttime';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const parttime = await db.parttime.findUnique({
            where: { id },
        });

        if (!parttime) {
            return ResponseUtil.clientError('兼职信息不存在', 404);
        }

        return ResponseUtil.success(parttime);
    } catch (error) {
        return ResponseUtil.serverError('获取兼职详情失败', error as Error);
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const existingParttime = await db.parttime.findUnique({
            where: { id },
        });

        if (!existingParttime) {
            return ResponseUtil.clientError('兼职信息不存在', 404);
        }

        const updateData: any = {};

        if (body.name !== undefined) {
            if (body.name.length < 1 || body.name.length > 100) {
                return ResponseUtil.clientError('兼职名称长度必须在1-100字符之间');
            }
            updateData.name = body.name;
        }
        if (body.type !== undefined) {
            if (body.type.length < 1 || body.type.length > 50) {
                return ResponseUtil.clientError('兼职类型长度必须在1-50字符之间');
            }
            updateData.type = body.type;
        }
        if (body.salary !== undefined) {
            if (body.salary.length < 1 || body.salary.length > 100) {
                return ResponseUtil.clientError('薪资信息长度必须在1-100字符之间');
            }
            updateData.salary = body.salary;
        }
        if (body.worktime !== undefined) {
            if (body.worktime.length < 1 || body.worktime.length > 200) {
                return ResponseUtil.clientError('工作时间长度必须在1-200字符之间');
            }
            updateData.worktime = body.worktime;
        }
        if (body.location !== undefined) {
            if (body.location.length < 1 || body.location.length > 200) {
                return ResponseUtil.clientError('工作地点长度必须在1-200字符之间');
            }
            updateData.location = body.location;
        }
        if (body.description !== undefined) {
            if (body.description.length < 1 || body.description.length > 2000) {
                return ResponseUtil.clientError('工作描述长度必须在1-2000字符之间');
            }
            updateData.description = body.description;
        }
        if (body.contact !== undefined) {
            const contactValidation = validateContact(body.contact);
            if (!contactValidation.isValid) {
                return ResponseUtil.clientError(
                    contactValidation.error || '联系方式格式不正确',
                    400
                );
            }
            updateData.contact = body.contact;
        }
        if (body.requirements !== undefined) {
            const requirementsValidation = validateRequirements(body.requirements);
            if (!requirementsValidation.isValid) {
                return ResponseUtil.clientError(
                    requirementsValidation.error || '要求字段格式不正确',
                    400
                );
            }
            updateData.requirements = body.requirements;
        }
        if (body.tags !== undefined) updateData.tags = body.tags;

        const parttime = await db.parttime.update({
            where: { id },
            data: updateData,
        });

        return ResponseUtil.success(parttime, '兼职信息更新成功');
    } catch (error) {
        return ResponseUtil.serverError('更新兼职信息失败', error as Error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existingParttime = await db.parttime.findUnique({
            where: { id },
        });

        if (!existingParttime) {
            return ResponseUtil.clientError('兼职信息不存在', 404);
        }

        await db.parttime.delete({
            where: { id },
        });

        return ResponseUtil.success({ message: '兼职信息删除成功' });
    } catch (error) {
        return ResponseUtil.serverError('删除兼职信息失败', error as Error);
    }
}
