import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
// import { ERROR_MESSAGES } from '@/lib/response';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin(request);

        const { id } = await params;
        const body = await request.json();

        // 检查餐厅是否存在
        const existingRestaurant = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingRestaurant) {
            return NextResponse.json(ResponseUtil.error('餐厅不存在'), { status: 404 });
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
        } = body;

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

        const updatedRestaurant = await db.restaurant.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(ResponseUtil.success(updatedRestaurant, '餐厅信息更新成功'));
    } catch (error) {
        console.error('管理员更新餐厅失败:', error);
        return NextResponse.json(ResponseUtil.error('更新餐厅失败'), { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(request);

        const { id } = await params;

        // 检查餐厅是否存在
        const existingRestaurant = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingRestaurant) {
            return NextResponse.json(ResponseUtil.error('餐厅不存在'), { status: 404 });
        }

        await db.restaurant.delete({
            where: { id },
        });

        return NextResponse.json(ResponseUtil.success(null, '餐厅删除成功'));
    } catch (error) {
        console.error('管理员删除餐厅失败:', error);
        return NextResponse.json(ResponseUtil.error('删除餐厅失败'), { status: 500 });
    }
}
