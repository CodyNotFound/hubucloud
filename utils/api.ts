'use client';

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// 请求方法类型
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API响应接口
interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
    message?: string;
}

// 请求配置接口
interface RequestConfig {
    method?: RequestMethod;
    headers?: Record<string, string>;
    body?: any;
    requireAuth?: boolean;
}

// Token管理
class TokenManager {
    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private static readonly USER_INFO_KEY = 'user_info';

    static getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    static setRefreshToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }

    // 用户信息缓存
    static getUserInfo(): any | null {
        if (typeof window === 'undefined') return null;
        try {
            const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);
            return userInfoStr ? JSON.parse(userInfoStr) : null;
        } catch (error) {
            console.error('解析用户信息缓存失败:', error);
            return null;
        }
    }

    static setUserInfo(userInfo: any): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
        } catch (error) {
            console.error('存储用户信息缓存失败:', error);
        }
    }

    static clearTokens(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_INFO_KEY);
    }

    static hasToken(): boolean {
        return !!this.getToken();
    }

    static hasUserInfo(): boolean {
        return !!this.getUserInfo();
    }
}

// 重定向到登录页
function redirectToLogin(): void {
    if (typeof window !== 'undefined') {
        // 清除所有认证信息
        TokenManager.clearTokens();

        // 保存当前页面路径，登录后可以返回
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth') {
            localStorage.setItem('redirect_after_login', currentPath);
        }

        // 重定向到登录页
        window.location.href = '/auth';
    }
}

// HTTP请求封装类
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // 构建完整URL
    private buildURL(endpoint: string): string {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${this.baseURL}${cleanEndpoint}`;
    }

    // 构建请求头
    private buildHeaders(config: RequestConfig): Headers {
        const headers = new Headers();

        // 设置默认headers
        headers.set('Content-Type', 'application/json');

        // 添加自定义headers
        if (config.headers) {
            Object.entries(config.headers).forEach(([key, value]) => {
                headers.set(key, value);
            });
        }

        // 添加认证token
        if (config.requireAuth !== false) {
            const token = TokenManager.getToken();
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }

        return headers;
    }

    // 处理响应
    private async handleResponse<T>(
        response: Response,
        endpoint?: string
    ): Promise<ApiResponse<T>> {
        try {
            const data: ApiResponse<T> = await response.json();

            // 检查是否需要重新登录
            if (data.status === 'error') {
                // 如果是登录接口，不要自动重定向
                const isLoginEndpoint =
                    endpoint?.includes('/users/login') || endpoint?.includes('/users/register');

                if (
                    !isLoginEndpoint &&
                    (data.error === '未登录' ||
                        data.error === 'Token无效或已过期' ||
                        data.error === '登录已过期' ||
                        data.error === 'token无效' ||
                        response.status === 401)
                ) {
                    redirectToLogin();
                    throw new Error('认证失败，正在跳转到登录页...');
                }
            }

            return data;
        } catch (error) {
            // 如果JSON解析失败，创建一个错误响应
            if (error instanceof SyntaxError) {
                return {
                    status: 'error',
                    error: `服务器响应格式错误 (${response.status})`,
                };
            }
            throw error;
        }
    }

    // 核心请求方法
    private async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const { method = 'GET', body, ...restConfig } = config;

        try {
            const url = this.buildURL(endpoint);
            const headers = this.buildHeaders(restConfig);

            const requestInit: RequestInit = {
                method,
                headers,
            };

            // 添加请求体
            if (body && method !== 'GET') {
                if (headers.get('Content-Type')?.includes('application/json')) {
                    requestInit.body = JSON.stringify(body);
                } else {
                    requestInit.body = body;
                }
            }

            const response = await fetch(url, requestInit);
            return await this.handleResponse<T>(response, endpoint);
        } catch (error) {
            console.error('API请求失败:', error);

            // 网络错误或其他错误
            if (error instanceof TypeError && error.message.includes('fetch')) {
                return {
                    status: 'error',
                    error: '网络连接失败，请检查网络设置',
                };
            }

            return {
                status: 'error',
                error: error instanceof Error ? error.message : '未知错误',
            };
        }
    }

    // GET请求
    async get<T>(
        endpoint: string,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    // POST请求
    async post<T>(
        endpoint: string,
        data?: any,
        config: Omit<RequestConfig, 'method'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
    }

    // PUT请求
    async put<T>(
        endpoint: string,
        data?: any,
        config: Omit<RequestConfig, 'method'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
    }

    // DELETE请求
    async delete<T>(
        endpoint: string,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }

    // PATCH请求
    async patch<T>(
        endpoint: string,
        data?: any,
        config: Omit<RequestConfig, 'method'> = {}
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
    }

    // 文件上传
    async upload<T>(
        endpoint: string,
        file: File,
        config: Omit<RequestConfig, 'method' | 'body'> = {}
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: formData,
            headers: {
                ...config.headers,
                // 不设置Content-Type，让浏览器自动设置multipart/form-data
            },
        });
    }
}

// 创建默认API客户端实例
const apiClient = new ApiClient();

// 导出API客户端和相关工具
export { apiClient as api, TokenManager, redirectToLogin, type ApiResponse, type RequestConfig };

// 便捷方法导出（绑定正确的this上下文）
export const get = apiClient.get.bind(apiClient);
export const post = apiClient.post.bind(apiClient);
export const put = apiClient.put.bind(apiClient);
export const del = apiClient.delete.bind(apiClient);
export const patch = apiClient.patch.bind(apiClient);
export const upload = apiClient.upload.bind(apiClient);

// 认证相关API
export const auth = {
    // 登录
    login: async (credentials: { username: string; password: string }) => {
        // 转换字段名以匹配后端API期望格式
        const requestData = {
            user: credentials.username,
            password: credentials.password,
        };
        const response = await post<{ token: string; refreshToken: string; user: any }>(
            '/users/login',
            requestData
        );

        if (response.status === 'success' && response.data) {
            TokenManager.setToken(response.data.token);
            if (response.data.refreshToken) {
                TokenManager.setRefreshToken(response.data.refreshToken);
            }
            // 缓存用户信息
            if (response.data.user) {
                TokenManager.setUserInfo(response.data.user);
            }
        }

        return response;
    },

    // 注册
    register: async (userData: { user: string; password: string }) => {
        const response = await post<{ token: string; refreshToken: string; user: any }>(
            '/users/register',
            userData
        );

        if (response.status === 'success' && response.data) {
            TokenManager.setToken(response.data.token);
            if (response.data.refreshToken) {
                TokenManager.setRefreshToken(response.data.refreshToken);
            }
            // 缓存用户信息
            if (response.data.user) {
                TokenManager.setUserInfo(response.data.user);
            }
        }

        return response;
    },

    // 登出
    logout: async () => {
        try {
            await post('/users/logout');
        } finally {
            TokenManager.clearTokens();
            window.location.href = '/auth';
        }
    },

    // 获取当前用户信息
    getCurrentUser: () => get('/users/me'),

    // 检查登录状态
    isLoggedIn: () => TokenManager.hasToken(),

    // 刷新token
    refreshToken: async () => {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
            redirectToLogin();
            return null;
        }

        const response = await post<{ token: string }>('/users/refresh', { refreshToken });
        if (response.status === 'success' && response.data) {
            TokenManager.setToken(response.data.token);
            return response.data.token;
        }

        redirectToLogin();
        return null;
    },
};
