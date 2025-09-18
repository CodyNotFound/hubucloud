/**
 * API 客户端配置
 * 统一的HTTP请求封装
 */

export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    requestId?: string;
    timestamp?: string;
}

export interface PaginationResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export class ApiClient {
    private baseURL: string;

    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<T>(`${endpoint}${query}`);
    }

    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    }

    async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }
}

// 创建默认的API客户端实例
export const apiClient = new ApiClient();
