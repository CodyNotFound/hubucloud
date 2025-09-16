import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { createId } from '@paralleldrive/cuid2';
import dayjs from 'dayjs';
import { HTTPException } from 'hono/http-exception';

import logger from '../utils/logger';

/**
 * 标准错误消息常量
 */
export const ERROR_MESSAGES = {
    // 认证相关
    UNAUTHORIZED: '未登录',
    TOKEN_INVALID: 'Token无效或已过期',
    FORBIDDEN: '权限不足',
    ADMIN_REQUIRED: '权限不足，需要管理员权限',

    // 用户相关
    USER_NOT_FOUND: '用户不存在',
    USERNAME_EXISTS: '用户名已存在',
    INVALID_CREDENTIALS: '用户名或密码错误',

    // 通用错误
    VALIDATION_ERROR: '输入数据不合法',
    NETWORK_ERROR: '网络连接失败',
    SERVER_ERROR: '服务器内部错误',
    NOT_FOUND: '资源不存在',
} as const;

/**
 * 标准响应格式
 * 成功响应: {status: 'success', data: T}
 * 错误响应: {status: 'error', error: string}
 */
export interface SuccessResponse<T = unknown> {
    status: 'success';
    data: T;
}

export interface ErrorResponse {
    status: 'error';
    error: string;
    errorId?: string; // 错误ID，用于服务器错误时关联数据库记录
}

export type StandardResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * 响应工具类
 * 提供统一的响应格式化功能，确保所有API响应遵循一致的格式。
 */
export class ResponseUtil {
    /**
     * 创建成功响应
     * @param c Hono Context
     * @param data 响应数据
     * @returns Response对象
     */
    static success<T>(c: Context, data: T): Response {
        const response: SuccessResponse<T> = {
            status: 'success',
            data,
        };

        return c.json(response);
    }

    /**
     * 创建错误响应
     * @param c Hono Context
     * @param errorMessage 错误消息
     * @param httpStatus HTTP状态码
     * @param errorType 错误类型: 'client' | 'server' | 'auth'
     * @param error 原始错误对象
     * @returns Response对象
     */
    static error(
        c: Context,
        errorMessage: string,
        httpStatus = 400,
        errorType: 'client' | 'server' | 'auth' = 'client',
        error?: Error
    ) {
        const response: ErrorResponse = {
            status: 'error',
            error: errorMessage,
        };

        if (errorType === 'server' && error) {
            const errorId = createId();
            response.errorId = errorId;

            // 异步记录服务器错误到数据库
            ResponseUtil.logServerError(errorId, error, c).catch((err) => {
                logger.error('Failed to log server error:', err);
            });
        } else if (errorType === 'auth') {
            // 认证/授权错误使用warning级别
            logger.warn(`Auth error: ${errorMessage} - ${c.req.method} ${c.req.path}`);
        } else {
            // 客户端错误使用info级别
            logger.info(`Client error: ${errorMessage} - ${c.req.method} ${c.req.path}`);
        }

        return c.json(response, httpStatus as ContentfulStatusCode);
    }

    /**
     * 便捷方法：客户端错误
     */
    static clientError(c: Context, message: string, httpStatus = 400) {
        return this.error(c, message, httpStatus, 'client');
    }

    /**
     * 便捷方法：服务器错误
     */
    static serverError(c: Context, message: string, error?: Error, httpStatus = 500) {
        return this.error(c, message, httpStatus, 'server', error);
    }

    /**
     * 便捷方法：认证错误
     */
    static authError(c: Context, message: string, httpStatus = 401) {
        return this.error(c, message, httpStatus, 'auth');
    }

    /**
     * 记录服务器错误到数据库和日志
     */
    private static async logServerError(
        errorId: string,
        err: Error | HTTPException | unknown,
        c: Context
    ): Promise<void> {
        try {
            const errorInfo = {
                id: errorId,
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : null,
                method: c.req.method,
                path: c.req.path,
                userAgent: c.req.header('user-agent'),
                timestamp: dayjs().toISOString(),
            };

            // 记录到日志
            logger.error(`Server Error [${errorId}]: ${errorInfo.message}`, {
                stack: errorInfo.stack,
                method: errorInfo.method,
                path: errorInfo.path,
                userAgent: errorInfo.userAgent,
            });

            // TODO: 这里可以添加数据库记录逻辑
            // await db.errorLog.create({ data: errorInfo });
        } catch (logError) {
            logger.error('Failed to log server error:', logError);
        }
    }

    private static async logError(
        err: Error | HTTPException | unknown,
        _c: Context
    ): Promise<void> {
        try {
            if (err instanceof HTTPException) {
                logger.warn(`HTTP Exception: ${err.message}`);
            } else if (err instanceof Error) {
                logger.error(`Error: ${err.message}\n${err.stack}`);
            } else {
                logger.error('Unknown error');
            }
        } catch (_error) {
            logger.error('Error in logError');
        }
    }
}
