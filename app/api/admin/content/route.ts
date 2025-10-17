import { NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { ResponseUtil } from '@/lib/response';
import { requireAdmin } from '@/lib/auth';
import { ERROR_MESSAGES } from '@/lib/response';

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);

        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword');
        const type = searchParams.get('type');

        console.log('🔍 内容管理查询参数:', { keyword, type });

        const where: any = {};

        // 强制只查询生活和娱乐类型
        if (type && (type === 'life' || type === 'entertainment')) {
            where.type = type;
        } else {
            // 如果没有指定type或指定了无效type，查询所有生活和娱乐类型
            where.type = {
                in: ['life', 'entertainment'],
            };
        }

        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { address: { contains: keyword, mode: 'insensitive' } },
                { locationDescription: { contains: keyword, mode: 'insensitive' } },
            ];
        }

        console.log('🔍 数据库查询条件:', where);

        const contents = await db.restaurant.findMany({
            where,
            orderBy: [
                { updatedAt: 'desc' },
                { id: 'asc' }, // 添加唯一标识符确保排序稳定性
            ],
        });

        console.log(`📋 查询结果: 找到 ${contents.length} 个内容`);
        if (contents.length > 0) {
            console.log(
                '前3个内容:',
                contents.slice(0, 3).map((r) => ({
                    id: r.id,
                    name: r.name,
                    type: r.type,
                }))
            );
        }

        return ResponseUtil.success({
            list: contents,
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
        return ResponseUtil.serverError('获取内容列表失败', error as Error);
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request);

        const body = await request.json();
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
            tags = [],
            preview = [],
            rating = 0,
            orderQrCode,
            blackCardAccepted = false,
        } = body;

        // 验证必填字段 - 只有名字是必须的
        if (!name) {
            return ResponseUtil.error('名称是必填字段', 400);
        }

        // 验证内容类型（仅限生活和娱乐）
        const validTypes = ['life', 'entertainment'];
        const finalType = type || 'life';
        if (!validTypes.includes(finalType)) {
            return ResponseUtil.error(
                `无效的内容类型: ${finalType}，有效类型为: ${validTypes.join(', ')}`,
                400
            );
        }

        const content = await db.restaurant.create({
            data: {
                name,
                address: address || '',
                phone: phone || '',
                description: description || '',
                type: finalType, // 使用已验证的类型
                cover: cover || '',
                openTime: openTime || '',
                locationDescription: locationDescription || '',
                latitude: latitude || 30.5951, // 默认湖北大学坐标
                longitude: longitude || 114.4086,
                tags,
                preview,
                rating,
                orderQrCode,
                blackCardAccepted,
            },
        });

        return ResponseUtil.success(content, '内容创建成功');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'UNAUTHORIZED') {
                return ResponseUtil.authError(ERROR_MESSAGES.UNAUTHORIZED);
            }
            if (error.message === 'FORBIDDEN') {
                return ResponseUtil.authError(ERROR_MESSAGES.ADMIN_REQUIRED, 403);
            }
        }
        return ResponseUtil.serverError('创建内容失败', error as Error);
    }
}
