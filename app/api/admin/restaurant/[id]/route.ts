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

        // 检查餐厅是否存在
        const existingRestaurant = await db.restaurant.findUnique({
            where: { id },
        });

        if (!existingRestaurant) {
            return ResponseUtil.error('餐厅不存在', 404);
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
            orderLink,
            blackCardAccepted,
            menuText,
            menuImages,
        } = body;

        // 验证餐厅类型（仅限餐饮类型）
        const validTypes = [
            'campusfood',
            'mainfood',
            'drinks',
            'nightmarket',
            'fruit',
            'dessert',
            'snacks',
        ];
        if (type !== undefined && !validTypes.includes(type)) {
            console.error('❌ 无效的餐厅类型:', { type, validTypes });
            return ResponseUtil.error(
                `无效的餐厅类型: ${type}，有效类型为: ${validTypes.join(', ')}`,
                400
            );
        }

        if (type !== undefined) {
            console.log('✅ 餐厅类型验证通过:', { type, restaurantId: id });
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
        if (orderLink !== undefined) updateData.orderLink = orderLink;
        if (blackCardAccepted !== undefined) updateData.blackCardAccepted = blackCardAccepted;
        if (menuText !== undefined) updateData.menuText = menuText;
        if (menuImages !== undefined) updateData.menuImages = menuImages;

        const updatedRestaurant = await db.restaurant.update({
            where: { id },
            data: updateData,
        });

        return ResponseUtil.success(updatedRestaurant, '餐厅信息更新成功');
    } catch (error) {
        console.error('管理员更新餐厅失败:', error);
        return ResponseUtil.serverError('更新餐厅失败', error as Error);
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
            return ResponseUtil.error('餐厅不存在', 404);
        }

        await db.restaurant.delete({
            where: { id },
        });

        return ResponseUtil.success(null, '餐厅删除成功');
    } catch (error) {
        console.error('管理员删除餐厅失败:', error);
        return ResponseUtil.serverError('删除餐厅失败', error as Error);
    }
}
