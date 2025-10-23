import { NextResponse } from 'next/server';

export interface StandardResponse<T = unknown> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    requestId?: string;
    timestamp?: string;
}

export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: '用户名或密码错误',
    USERNAME_EXISTS: '用户名已存在',
    USER_NOT_FOUND: '用户不存在',
    UNAUTHORIZED: '未授权访问',
    FORBIDDEN: '权限不足',
    ADMIN_REQUIRED: '需要管理员权限',
    INVALID_REQUEST: '请求参数无效',
    SERVER_ERROR: '服务器内部错误',
} as const;

export class ResponseUtil {
    static success<T>(data?: T, message?: string, status = 200): NextResponse<StandardResponse<T>> {
        return NextResponse.json(
            {
                status: 'success',
                message,
                data,
                timestamp: new Date().toISOString(),
            },
            { status }
        );
    }

    static error(message: string, status = 400, error?: Error): NextResponse<StandardResponse> {
        const response: StandardResponse = {
            status: 'error',
            message,
            timestamp: new Date().toISOString(),
        };

        if (status >= 500 && error) {
            response.requestId = Math.random().toString(36).substring(2, 15);
            console.error(`[${response.requestId}] Server Error:`, error);
        }

        return NextResponse.json(response, { status });
    }

    static clientError(message: string, status = 400): NextResponse<StandardResponse> {
        return this.error(message, status);
    }

    static serverError(message: string, error?: Error): NextResponse<StandardResponse> {
        return this.error(message, 500, error);
    }

    static authError(message: string, status = 401): NextResponse<StandardResponse> {
        return this.error(message, status);
    }
}
