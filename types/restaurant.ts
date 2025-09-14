/**
 * 餐厅相关类型定义
 */

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    type: string;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    latitude: number;
    longitude: number;
    createdAt?: string;
    updatedAt?: string;
    distance?: number; // 计算出的距离
}

export interface CreateRestaurantData {
    name: string;
    address: string;
    phone: string;
    description: string;
    type: string;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    latitude: number;
    longitude: number;
}

export interface UpdateRestaurantData {
    name?: string;
    address?: string;
    phone?: string;
    description?: string;
    type?: string;
    cover?: string;
    tags?: string[];
    preview?: string[];
    openTime?: string;
    rating?: number;
    latitude?: number;
    longitude?: number;
}

export interface RestaurantQuery {
    page?: number;
    limit?: number;
    type?: string;
    tags?: string;
    keyword?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
}
