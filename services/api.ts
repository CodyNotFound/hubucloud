'use client';

import type { ApiResponse, FilterParams, Parttime, Restaurant } from '@/types';

import { get } from '@/utils/api';

// 通用数据获取服务
export class DataService {
    // 兼职服务
    static parttime = {
        async getList(
            params: FilterParams = {}
        ): Promise<ApiResponse<{ parttimes: Parttime[]; pagination: any }>> {
            const query = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== '') {
                    query.append(key, params[key].toString());
                }
            });

            const endpoint = query.toString() ? `/parttime?${query}` : '/parttime';
            return get(endpoint);
        },

        async getByType(type: string, params: FilterParams = {}) {
            return this.getList({ ...params, type });
        },
    };

    // 餐厅服务
    static restaurant = {
        async getList(
            params: FilterParams = {}
        ): Promise<ApiResponse<{ restaurants: Restaurant[]; pagination: any }>> {
            const query = new URLSearchParams();
            Object.keys(params).forEach((key) => {
                if (params[key] !== undefined && params[key] !== '') {
                    query.append(key, params[key].toString());
                }
            });

            const endpoint = query.toString() ? `/restaurants?${query}` : '/restaurants';
            return get(endpoint);
        },

        async getByType(type: string, params: FilterParams = {}) {
            return this.getList({ ...params, type });
        },
    };
}

// 便捷导出
export const { parttime: parttimeAPI, restaurant: restaurantAPI } = DataService;
