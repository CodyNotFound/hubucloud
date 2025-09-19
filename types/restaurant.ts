/**
 * 餐厅相关类型定义
 */

// 餐厅类型枚举
export type RestaurantType = 'campusfood' | 'mainfood' | 'drinks' | 'nightmarket';

// 餐厅类型中文名称映射
export const RestaurantTypeLabels: Record<RestaurantType, string> = {
    campusfood: '校园食堂',
    mainfood: '主食',
    drinks: '饮品店',
    nightmarket: '夜市',
};

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    type: RestaurantType;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    locationDescription: string;
    createdAt?: string;
    updatedAt?: string;
    distance?: number; // 计算出的距离
}

export interface CreateRestaurantData {
    name: string;
    address: string;
    phone: string;
    description: string;
    type: RestaurantType;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    locationDescription: string;
}

export interface UpdateRestaurantData {
    name?: string;
    address?: string;
    phone?: string;
    description?: string;
    type?: RestaurantType;
    cover?: string;
    tags?: string[];
    preview?: string[];
    openTime?: string;
    rating?: number;
    locationDescription?: string;
}

export interface RestaurantQuery {
    page?: number;
    limit?: number;
    type?: RestaurantType;
    tags?: string;
    keyword?: string;
    locationDescription?: string;
    radius?: number;
}
