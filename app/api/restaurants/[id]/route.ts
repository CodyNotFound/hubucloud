import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const restaurant = await db.restaurant.findUnique({
            where: { id },
        });

        if (!restaurant) {
            return ResponseUtil.clientError('餐厅不存在', 404);
        }

        return ResponseUtil.success(restaurant);
    } catch (error) {
        return ResponseUtil.serverError('获取餐厅详情失败', error as Error);
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const existingRestaurant = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingRestaurant) {
            return ResponseUtil.clientError('餐厅不存在', 404);
        }

        const updateData: any = {};

        if (body.name !== undefined) {
            if (body.name.length < 1 || body.name.length > 100) {
                return ResponseUtil.clientError('餐厅名称长度必须在1-100字符之间');
            }
            updateData.name = body.name;
        }
        if (body.address !== undefined) {
            if (body.address.length < 1 || body.address.length > 200) {
                return ResponseUtil.clientError('地址长度必须在1-200字符之间');
            }
            updateData.address = body.address;
        }
        if (body.phone !== undefined) {
            if (body.phone.length < 1 || body.phone.length > 20) {
                return ResponseUtil.clientError('电话长度必须在1-20字符之间');
            }
            updateData.phone = body.phone;
        }
        if (body.description !== undefined) {
            if (body.description.length < 1 || body.description.length > 1000) {
                return ResponseUtil.clientError('描述长度必须在1-1000字符之间');
            }
            updateData.description = body.description;
        }
        if (body.type !== undefined) {
            if (body.type.length < 1 || body.type.length > 50) {
                return ResponseUtil.clientError('类型长度必须在1-50字符之间');
            }
            updateData.type = body.type;
        }
        if (body.cover !== undefined) updateData.cover = body.cover;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.preview !== undefined) updateData.preview = body.preview;
        if (body.openTime !== undefined) updateData.openTime = body.openTime;
        if (body.orderQrCode !== undefined) updateData.orderQrCode = body.orderQrCode;
        if (body.rating !== undefined) {
            if (body.rating < 1 || body.rating > 5) {
                return ResponseUtil.clientError('评分必须在1-5之间');
            }
            updateData.rating = body.rating;
        }
        if (body.latitude !== undefined) updateData.latitude = body.latitude;
        if (body.longitude !== undefined) updateData.longitude = body.longitude;

        const restaurant = await db.restaurant.update({
            where: { id },
            data: updateData,
        });

        return ResponseUtil.success(restaurant, '餐厅信息更新成功');
    } catch (error) {
        return ResponseUtil.serverError('更新餐厅信息失败', error as Error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existingRestaurant = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingRestaurant) {
            return ResponseUtil.clientError('餐厅不存在', 404);
        }

        await db.restaurant.delete({
            where: { id },
        });

        return ResponseUtil.success({ message: '餐厅删除成功' });
    } catch (error) {
        return ResponseUtil.serverError('删除餐厅失败', error as Error);
    }
}
