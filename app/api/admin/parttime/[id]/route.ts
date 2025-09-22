import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
// import { ERROR_MESSAGES } from '@/lib/response';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);

        const { id } = await params;
        const body = await request.json();

        // 检查兼职是否存在
        const existingParttime = await db.parttime.findUnique({
            where: { id },
        });

        if (!existingParttime) {
            return ResponseUtil.error('兼职不存在', 404);
        }

        const { name, salary, worktime, location, description, contact, requirements, tags } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (salary !== undefined) updateData.salary = salary;
        if (worktime !== undefined) updateData.worktime = worktime;
        if (location !== undefined) updateData.location = location;
        if (description !== undefined) updateData.description = description;
        if (contact !== undefined) updateData.contact = contact;
        if (requirements !== undefined) updateData.requirements = requirements;
        if (tags !== undefined) updateData.tags = tags;

        const updatedParttime = await db.parttime.update({
            where: { id },
            data: updateData,
        });

        return ResponseUtil.success(updatedParttime, '兼职信息更新成功');
    } catch (error) {
        console.error('管理员更新兼职失败:', error);
        return ResponseUtil.serverError('更新兼职失败', error as Error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);

        const { id } = await params;

        // 检查兼职是否存在
        const existingParttime = await db.parttime.findUnique({
            where: { id },
        });

        if (!existingParttime) {
            return ResponseUtil.error('兼职不存在', 404);
        }

        await db.parttime.delete({
            where: { id },
        });

        return ResponseUtil.success(null, '兼职删除成功');
    } catch (error) {
        console.error('管理员删除兼职失败:', error);
        return ResponseUtil.serverError('删除兼职失败', error as Error);
    }
}
