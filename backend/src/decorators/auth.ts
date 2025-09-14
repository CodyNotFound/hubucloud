import type { Context } from 'hono';

import { JWTUtil, type UserTokenPayload } from '@/utils/jwt';
import { ResponseUtil } from '@/core/response';

/**
 * JWT认证装饰器
 */
export function RequireAuth() {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (c: Context, ...args: any[]) {
            const authHeader = c.req.header('Authorization');
            const token = JWTUtil.extractTokenFromHeader(authHeader);

            if (!token) {
                return ResponseUtil.clientError(c, '未登录', 401);
            }

            const payload = JWTUtil.verifyToken(token);
            if (!payload) {
                return ResponseUtil.clientError(c, 'Token无效或已过期', 401);
            }

            // 将用户信息存储到上下文中
            c.set('currentUser', payload);

            return method.call(this, c, ...args);
        };
    };
}

/**
 * 管理员权限装饰器
 */
export function RequireAdmin() {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (c: Context, ...args: any[]) {
            const authHeader = c.req.header('Authorization');
            const token = JWTUtil.extractTokenFromHeader(authHeader);

            if (!token) {
                return ResponseUtil.clientError(c, '未登录', 401);
            }

            const payload = JWTUtil.verifyToken(token);
            if (!payload) {
                return ResponseUtil.clientError(c, 'Token无效或已过期', 401);
            }

            if (payload.role !== 'ADMIN') {
                return ResponseUtil.clientError(c, '权限不足，需要管理员权限', 403);
            }

            // 将用户信息存储到上下文中
            c.set('currentUser', payload);

            return method.call(this, c, ...args);
        };
    };
}

/**
 * 可选认证装饰器（如果有token则验证，没有也可以继续）
 */
export function OptionalAuth() {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (c: Context, ...args: any[]) {
            const authHeader = c.req.header('Authorization');
            const token = JWTUtil.extractTokenFromHeader(authHeader);

            if (token) {
                const payload = JWTUtil.verifyToken(token);
                if (payload) {
                    c.set('currentUser', payload);
                }
            }

            return method.call(this, c, ...args);
        };
    };
}

/**
 * 获取当前用户信息的工具函数
 */
export function getCurrentUser(c: Context): UserTokenPayload | null {
    return c.get('currentUser') || null;
}
