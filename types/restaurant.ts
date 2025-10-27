/**
 * 餐厅相关类型定义
 */

// 餐厅类型枚举
export type RestaurantType =
    | 'campusfood'
    | 'mainfood'
    | 'drinks'
    | 'nightmarket'
    | 'fruit'
    | 'dessert'
    | 'snacks'
    | 'life'
    | 'entertainment';

// 餐厅类型中文名称映射
export const RestaurantTypeLabels: Record<RestaurantType, string> = {
    campusfood: '校园食堂',
    mainfood: '主食',
    drinks: '饮品店',
    nightmarket: '夜市',
    fruit: '水果',
    dessert: '甜品',
    snacks: '小吃',
    life: '生活',
    entertainment: '娱乐',
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
    orderQrCode?: string; // 点餐码图片URL
    orderLink?: string; // 点餐直链URL
    blackCardAccepted?: boolean; // 是否支持黑卡
    menuText?: string; // 菜单文字描述
    menuImages?: string[]; // 菜单图片URL数组
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
    orderQrCode?: string; // 点餐码图片URL
    orderLink?: string; // 点餐直链URL
    blackCardAccepted?: boolean; // 是否支持黑卡
    menuText?: string; // 菜单文字描述
    menuImages?: string[]; // 菜单图片URL数组
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
    orderQrCode?: string; // 点餐码图片URL
    orderLink?: string; // 点餐直链URL
    blackCardAccepted?: boolean; // 是否支持黑卡
    menuText?: string; // 菜单文字描述
    menuImages?: string[]; // 菜单图片URL数组
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

/**
 * 餐厅搜索数据（轻量级，用于客户端缓存和本地搜索）
 */
export interface RestaurantSearchItem {
    id: string;
    name: string;
    type: RestaurantType;
    locationDescription: string;
    tags: string[];
    menuText?: string; // 菜单文字（用于搜索）
}
