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

        // 检查内容是否存在
        const existingContent = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingContent) {
            return ResponseUtil.error('内容不存在', 404);
        }

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
            tags,
            preview,
            rating,
            orderQrCode,
            blackCardAccepted,
        } = body;

        // 验证内容类型（仅限生活和娱乐）
        const validTypes = ['life', 'entertainment'];
        if (type !== undefined && !validTypes.includes(type)) {
            console.error('❌ 无效的内容类型:', { type, validTypes });
            return ResponseUtil.error(
                `无效的内容类型: ${type}，有效类型为: ${validTypes.join(', ')}`,
                400
            );
        }

        if (type !== undefined) {
            console.log('✅ 内容类型验证通过:', { type, contentId: id });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (phone !== undefined) updateData.phone = phone;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (cover !== undefined) updateData.cover = cover;
        if (openTime !== undefined) updateData.openTime = openTime;
        if (locationDescription !== undefined) updateData.locationDescription = locationDescription;
        if (latitude !== undefined) updateData.latitude = latitude;
        if (longitude !== undefined) updateData.longitude = longitude;
        if (tags !== undefined) updateData.tags = tags;
        if (preview !== undefined) updateData.preview = preview;
        if (rating !== undefined) updateData.rating = rating;
        if (orderQrCode !== undefined) updateData.orderQrCode = orderQrCode;
        if (blackCardAccepted !== undefined) updateData.blackCardAccepted = blackCardAccepted;

        const updatedContent = await db.restaurant.update({
            where: { id },
            data: updateData,
        });

        return ResponseUtil.success(updatedContent, '内容信息更新成功');
    } catch (error) {
        console.error('管理员更新内容失败:', error);
        return ResponseUtil.serverError('更新内容失败', error as Error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);

        const { id } = await params;

        // 检查内容是否存在
        const existingContent = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingContent) {
            return ResponseUtil.error('内容不存在', 404);
        }

        await db.restaurant.delete({
            where: { id },
        });

        return ResponseUtil.success(null, '内容删除成功');
    } catch (error) {
        console.error('管理员删除内容失败:', error);
        return ResponseUtil.serverError('删除内容失败', error as Error);
    }
}
