import type { Parttime, Restaurant, ApiResponse, Config, ConfigFormData } from '@/types';
import type { Activity, ActivityFormData } from '@/types/activity';

import { apiClient } from './api-client';

export interface AdminStats {
    totalUsers: number;
    totalAdmins: number;
    regularUsers: number;
    totalRestaurants: number;
    totalParttime: number;
}

export interface AdminCheckResponse {
    isAdmin: boolean;
    user: {
        id: string;
        username: string;
        role: string;
    };
}

export interface PaginatedResponse<T> {
    list: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * 管理员服务类
 * 提供所有管理员相关的API调用功能
 */
class AdminService {
    /**
     * 检查管理员权限
     */
    async checkAdminRole(): Promise<ApiResponse<AdminCheckResponse>> {
        return apiClient.get('/api/admin/check');
    }

    /**
     * 初始化第一个管理员
     */
    async initFirstAdmin(userId: string): Promise<ApiResponse<any>> {
        return apiClient.post('/api/admin/init-admin', { userId });
    }

    /**
     * 获取管理员统计数据
     */
    async getAdminStats(): Promise<ApiResponse<{ stats: AdminStats }>> {
        return apiClient.get('/api/admin/stats');
    }

    /**
     * 提升用户为管理员
     */
    async promoteUser(targetUserId: string): Promise<ApiResponse<any>> {
        return apiClient.post('/api/admin/promote-user', { targetUserId });
    }

    /**
     * 撤销用户的管理员权限
     */
    async demoteAdmin(targetUserId: string): Promise<ApiResponse<any>> {
        return apiClient.post('/api/admin/demote-admin', { targetUserId });
    }

    // ============ 兼职管理相关方法 ============

    /**
     * 获取兼职列表（管理员）
     */
    async getParttimeList(
        params: {
            page?: number;
            limit?: number;
            keyword?: string;
            type?: string;
        } = {}
    ): Promise<ApiResponse<{ list: Parttime[]; pagination: any }>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.type) queryParams.append('type', params.type);

        const query = queryParams.toString();
        return apiClient.get(`/api/admin/parttime${query ? `?${query}` : ''}`);
    }

    /**
     * 创建兼职（管理员）
     */
    async createParttime(data: {
        name: string;
        type: string;
        salary: string;
        worktime: string;
        location: string;
        description: string;
        contact: string;
        requirements?: string;
    }): Promise<ApiResponse<Parttime>> {
        return apiClient.post('/api/admin/parttime', data);
    }

    /**
     * 更新兼职信息（管理员）
     */
    async updateParttime(
        id: string,
        data: {
            name?: string;
            type?: string;
            salary?: string;
            worktime?: string;
            location?: string;
            description?: string;
            contact?: string;
            requirements?: string;
        }
    ): Promise<ApiResponse<Parttime>> {
        return apiClient.put(`/api/admin/parttime/${id}`, data);
    }

    /**
     * 删除兼职（管理员）
     */
    async deleteParttime(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/api/admin/parttime/${id}`);
    }

    // ============ 餐厅管理相关方法 ============

    /**
     * 获取餐厅列表（管理员）
     */
    async getRestaurantList(
        params: {
            page?: number;
            limit?: number;
            keyword?: string;
            type?: string;
        } = {}
    ): Promise<ApiResponse<{ list: Restaurant[]; pagination: any }>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.type) queryParams.append('type', params.type);

        const query = queryParams.toString();
        return apiClient.get(`/api/admin/restaurant${query ? `?${query}` : ''}`);
    }

    /**
     * 创建餐厅（管理员）
     */
    async createRestaurant(data: {
        name: string;
        address: string;
        phone: string;
        description: string;
        type: string;
        cover: string;
        openTime: string;
        locationDescription?: string;
        latitude: number;
        longitude: number;
        tags?: string[];
        preview?: string[];
        rating?: number;
        orderQrCode?: string;
        orderLink?: string;
        blackCardAccepted?: boolean;
        menuText?: string;
        menuImages?: string[];
    }): Promise<ApiResponse<Restaurant>> {
        return apiClient.post('/api/admin/restaurant', data);
    }

    /**
     * 更新餐厅信息（管理员）
     */
    async updateRestaurant(
        id: string,
        data: {
            name?: string;
            address?: string;
            phone?: string;
            description?: string;
            type?: string;
            cover?: string;
            openTime?: string;
            locationDescription?: string;
            latitude?: number;
            longitude?: number;
            tags?: string[];
            preview?: string[];
            rating?: number;
            orderQrCode?: string;
            orderLink?: string;
            blackCardAccepted?: boolean;
            menuText?: string;
            menuImages?: string[];
        }
    ): Promise<ApiResponse<Restaurant>> {
        return apiClient.put(`/api/admin/restaurant/${id}`, data);
    }

    /**
     * 删除餐厅（管理员）
     */
    async deleteRestaurant(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/api/admin/restaurant/${id}`);
    }

    // ============ 其他内容管理相关方法 ============

    /**
     * 获取其他内容列表（管理员）- 生活和娱乐
     */
    async getContentList(
        params: {
            page?: number;
            limit?: number;
            keyword?: string;
            type?: string;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.type) queryParams.append('type', params.type);

        const query = queryParams.toString();
        return apiClient.get(`/api/admin/content${query ? `?${query}` : ''}`);
    }

    /**
     * 创建其他内容（管理员）- 生活和娱乐
     */
    async createContent(data: {
        name: string;
        address: string;
        phone: string;
        description: string;
        type: string;
        cover: string;
        openTime: string;
        latitude: number;
        longitude: number;
        tags?: string[];
        preview?: string[];
        rating?: number;
    }): Promise<ApiResponse<Restaurant>> {
        return apiClient.post('/api/admin/content', data);
    }

    /**
     * 更新其他内容信息（管理员）- 生活和娱乐
     */
    async updateContent(
        id: string,
        data: {
            name?: string;
            address?: string;
            phone?: string;
            description?: string;
            type?: string;
            cover?: string;
            openTime?: string;
            latitude?: number;
            longitude?: number;
            tags?: string[];
            preview?: string[];
            rating?: number;
        }
    ): Promise<ApiResponse<Restaurant>> {
        return apiClient.put(`/api/admin/content/${id}`, data);
    }

    /**
     * 删除其他内容（管理员）- 生活和娱乐
     */
    async deleteContent(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/api/admin/content/${id}`);
    }

    // ============ 活动管理相关方法 ============

    /**
     * 获取活动列表（管理员）
     */
    async getActivityList(
        params: {
            page?: number;
            limit?: number;
            keyword?: string;
            status?: string;
            enabled?: boolean;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Activity>>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.status) queryParams.append('status', params.status);
        if (params.enabled !== undefined) queryParams.append('enabled', params.enabled.toString());

        const query = queryParams.toString();
        return apiClient.get(`/api/admin/activity${query ? `?${query}` : ''}`);
    }

    /**
     * 创建活动（管理员）
     */
    async createActivity(data: ActivityFormData): Promise<ApiResponse<Activity>> {
        return apiClient.post('/api/admin/activity', data);
    }

    /**
     * 更新活动信息（管理员）
     */
    async updateActivity(
        id: string,
        data: Partial<ActivityFormData>
    ): Promise<ApiResponse<Activity>> {
        return apiClient.put(`/api/admin/activity/${id}`, data);
    }

    /**
     * 删除活动（管理员）
     */
    async deleteActivity(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/api/admin/activity/${id}`);
    }

    // ============ 配置管理相关方法 ============

    /**
     * 获取配置列表（管理员）
     */
    async getConfigList(
        params: {
            page?: number;
            limit?: number;
            keyword?: string;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Config>>> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);

        const query = queryParams.toString();
        return apiClient.get(`/api/admin/config${query ? `?${query}` : ''}`);
    }

    /**
     * 获取单个配置（管理员）
     */
    async getConfig(key: string): Promise<ApiResponse<Config | null>> {
        return apiClient.get(`/api/admin/config?key=${encodeURIComponent(key)}`);
    }

    /**
     * 创建配置（管理员）
     */
    async createConfig(data: ConfigFormData): Promise<ApiResponse<Config>> {
        return apiClient.post('/api/admin/config', data);
    }

    /**
     * 更新配置（管理员）
     */
    async updateConfig(
        key: string,
        data: Partial<ConfigFormData>
    ): Promise<ApiResponse<Config>> {
        return apiClient.put(`/api/admin/config/${encodeURIComponent(key)}`, data);
    }

    /**
     * 删除配置（管理员）
     */
    async deleteConfig(key: string): Promise<ApiResponse<null>> {
        return apiClient.delete(`/api/admin/config/${encodeURIComponent(key)}`);
    }
}

// 导出单例实例
export const adminService = new AdminService();
