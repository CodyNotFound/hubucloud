/**
 * API客户端
 * 提供统一的HTTP请求接口，包含认证、错误处理等功能
 */
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || '') {
        this.baseURL = baseURL;
    }

    /**
     * 获取认证头
     */
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    /**
     * 处理响应
     */
    private async handleResponse(response: Response) {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(data.message || '请求失败') as any;
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    /**
     * GET请求
     */
    async get<T = any>(url: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * POST请求
     */
    async post<T = any>(url: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }

    /**
     * PUT请求
     */
    async put<T = any>(url: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }

    /**
     * DELETE请求
     */
    async delete<T = any>(url: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * PATCH请求
     */
    async patch<T = any>(url: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse(response);
    }
}

// 导出单例实例
export const apiClient = new ApiClient();
