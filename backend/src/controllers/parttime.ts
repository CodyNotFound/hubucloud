import type { Context } from 'hono';

import { Controller } from '@/decorators/controller';
import { Get, Post, Put, Delete } from '@/decorators/http';
import { Body, Query, Param } from '@/decorators/params';
import { Required, Length } from '@/decorators/validation';
import { ResponseUtil } from '@/core/response';
import { db } from '@/utils/db';
import {
    validateContact,
    validateRequirements,
    parseContact,
    parseGenderRequirement,
} from '@/utils/parttime';

/**
 * 兼职信息控制器
 * 提供兼职信息的增删改查功能
 */
@Controller('/api/parttime')
export class ParttimeController {
    /**
     * 获取所有兼职列表
     * 支持分页和类型筛选
     */
    @Get('/')
    async getParttimes(
        c: Context,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('location') location?: string,
    ) {
        try {
            const pageNum = page ? Math.max(1, parseInt(page) || 1) : 1;
            const limitNum = limit ? Math.max(1, Math.min(100, parseInt(limit) || 10)) : 10;
            const skip = (pageNum - 1) * limitNum;

            // 构建查询条件
            const where: any = {};
            if (type) {
                where.type = type;
            }
            if (location) {
                where.location = {
                    contains: location,
                    mode: 'insensitive',
                };
            }

            // 获取兼职列表
            const parttimes = await db.parttime.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // 获取总数用于分页
            const total = await db.parttime.count({ where });

            return ResponseUtil.success(c, {
                parttimes,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取兼职列表失败', error as Error);
        }
    }

    /**
     * 搜索兼职
     */
    @Get('/search')
    async searchParttimes(
        c: Context,
        @Query('keyword') @Required() keyword: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        try {
            const pageNum = page ? Math.max(1, parseInt(page) || 1) : 1;
            const limitNum = limit ? Math.max(1, Math.min(100, parseInt(limit) || 10)) : 10;
            const skip = (pageNum - 1) * limitNum;

            const parttimes = await db.parttime.findMany({
                where: {
                    OR: [
                        { name: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } },
                        { location: { contains: keyword, mode: 'insensitive' } },
                        { type: { contains: keyword, mode: 'insensitive' } },
                    ],
                },
                skip,
                take: limitNum,
                orderBy: {
                    createdAt: 'desc',
                },
            });

            const total = await db.parttime.count({
                where: {
                    OR: [
                        { name: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } },
                        { location: { contains: keyword, mode: 'insensitive' } },
                        { type: { contains: keyword, mode: 'insensitive' } },
                    ],
                },
            });

            return ResponseUtil.success(c, {
                parttimes,
                keyword,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '搜索兼职失败', error as Error);
        }
    }

    /**
     * 根据ID获取兼职详情
     */
    @Get('/:id')
    async getParttimeById(c: Context, @Param('id') @Required() id: string) {
        try {
            const parttime = await db.parttime.findUnique({
                where: { id },
            });

            if (!parttime) {
                return ResponseUtil.clientError(c, '兼职信息不存在', 404);
            }

            return ResponseUtil.success(c, parttime);
        } catch (error) {
            return ResponseUtil.serverError(c, '获取兼职详情失败', error as Error);
        }
    }

    /**
     * 发布新兼职
     */
    @Post('/')
    async createParttime(
        c: Context,
        @Body('name') @Required() @Length(1, 100) name: string,
        @Body('type') @Required() @Length(1, 50) type: string,
        @Body('salary') @Required() @Length(1, 100) salary: string,
        @Body('worktime') @Required() @Length(1, 200) worktime: string,
        @Body('location') @Required() @Length(1, 200) location: string,
        @Body('description') @Required() @Length(1, 2000) description: string,
        @Body('contact') @Required() contact: string,
        @Body('requirements') requirements?: string
    ) {
        try {
            // 验证联系方式格式
            const contactValidation = validateContact(contact);
            if (!contactValidation.isValid) {
                return ResponseUtil.clientError(
                    c,
                    contactValidation.error || '联系方式格式不正确',
                    400
                );
            }

            // 验证要求字段格式
            if (requirements) {
                const requirementsValidation = validateRequirements(requirements);
                if (!requirementsValidation.isValid) {
                    return ResponseUtil.clientError(
                        c,
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

            return ResponseUtil.success(c, parttime);
        } catch (error) {
            return ResponseUtil.serverError(c, '发布兼职失败', error as Error);
        }
    }

    /**
     * 更新兼职信息
     */
    @Put('/:id')
    async updateParttime(
        c: Context,
        @Param('id') @Required() id: string,
        @Body('name') @Length(1, 100) name?: string,
        @Body('type') @Length(1, 50) type?: string,
        @Body('salary') @Length(1, 100) salary?: string,
        @Body('worktime') @Length(1, 200) worktime?: string,
        @Body('location') @Length(1, 200) location?: string,
        @Body('description') @Length(1, 2000) description?: string,
        @Body('contact') contact?: string,
        @Body('requirements') requirements?: string
    ) {
        try {
            // 检查兼职是否存在
            const existingParttime = await db.parttime.findUnique({
                where: { id },
            });

            if (!existingParttime) {
                return ResponseUtil.clientError(c, '兼职信息不存在', 404);
            }

            // 验证联系方式格式（如果提供了）
            if (contact !== undefined) {
                const contactValidation = validateContact(contact);
                if (!contactValidation.isValid) {
                    return ResponseUtil.clientError(
                        c,
                        contactValidation.error || '联系方式格式不正确',
                        400
                    );
                }
            }

            // 验证要求字段格式（如果提供了）
            if (requirements !== undefined) {
                const requirementsValidation = validateRequirements(requirements);
                if (!requirementsValidation.isValid) {
                    return ResponseUtil.clientError(
                        c,
                        requirementsValidation.error || '要求字段格式不正确',
                        400
                    );
                }
            }

            // 构建更新数据对象
            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (type !== undefined) updateData.type = type;
            if (salary !== undefined) updateData.salary = salary;
            if (worktime !== undefined) updateData.worktime = worktime;
            if (location !== undefined) updateData.location = location;
            if (description !== undefined) updateData.description = description;
            if (contact !== undefined) updateData.contact = contact;
            if (requirements !== undefined) updateData.requirements = requirements;

            const parttime = await db.parttime.update({
                where: { id },
                data: updateData,
            });

            return ResponseUtil.success(c, parttime);
        } catch (error) {
            return ResponseUtil.serverError(c, '更新兼职信息失败', error as Error);
        }
    }

    /**
     * 删除兼职
     */
    @Delete('/:id')
    async deleteParttime(c: Context, @Param('id') @Required() id: string) {
        try {
            // 检查兼职是否存在
            const existingParttime = await db.parttime.findUnique({
                where: { id },
            });

            if (!existingParttime) {
                return ResponseUtil.clientError(c, '兼职信息不存在', 404);
            }

            await db.parttime.delete({
                where: { id },
            });

            return ResponseUtil.success(c, { message: '兼职信息删除成功' });
        } catch (error) {
            return ResponseUtil.serverError(c, '删除兼职信息失败', error as Error);
        }
    }

    /**
     * 根据类型获取兼职
     */
    @Get('/type/:type')
    async getParttimesByType(
        c: Context,
        @Param('type') @Required() type: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        try {
            const pageNum = page ? Math.max(1, parseInt(page) || 1) : 1;
            const limitNum = limit ? Math.max(1, Math.min(100, parseInt(limit) || 10)) : 10;
            const skip = (pageNum - 1) * limitNum;

            const parttimes = await db.parttime.findMany({
                where: { type },
                skip,
                take: limitNum,
                orderBy: {
                    createdAt: 'desc',
                },
            });

            const total = await db.parttime.count({
                where: { type },
            });

            return ResponseUtil.success(c, {
                parttimes,
                type,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            return ResponseUtil.serverError(c, '获取兼职列表失败', error as Error);
        }
    }

    /**
     * 解析联系方式信息
     */
    @Post('/parse-contact')
    async parseContactInfo(c: Context, @Body('contact') @Required() contact: string) {
        try {
            const contactValidation = validateContact(contact);
            if (!contactValidation.isValid) {
                return ResponseUtil.clientError(
                    c,
                    contactValidation.error || '联系方式格式不正确',
                    400
                );
            }

            const parsed = parseContact(contact);
            return ResponseUtil.success(c, parsed);
        } catch (error) {
            return ResponseUtil.serverError(c, '解析联系方式失败', error as Error);
        }
    }

    /**
     * 解析要求字段信息
     */
    @Post('/parse-requirements')
    async parseRequirementsInfo(c: Context, @Body('requirements') requirements?: string) {
        try {
            if (requirements) {
                const requirementsValidation = validateRequirements(requirements);
                if (!requirementsValidation.isValid) {
                    return ResponseUtil.clientError(
                        c,
                        requirementsValidation.error || '要求字段格式不正确',
                        400
                    );
                }
            }

            const parsed = parseGenderRequirement(requirements);
            return ResponseUtil.success(c, parsed);
        } catch (error) {
            return ResponseUtil.serverError(c, '解析要求字段失败', error as Error);
        }
    }
}
