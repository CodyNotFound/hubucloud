import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

// 用户信息类型定义（与后端API保持一致）
export interface User {
    id: string;
    user: string; // 用户名/登录名
    name: string; // 真实姓名
    avatar: string;
    role: 'USER' | 'ADMIN';
    phone: string;
    studentId: string;
    major: string;
    grade: number;
    createdAt: string; // 创建时间
}

// 通用API响应类型
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    error?: string;
    requestId?: string;
    timestamp?: string;
}

// 分页数据类型
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationInfo;
}

// 兼职信息类型
export interface Parttime {
    id: string;
    name: string;
    type: string;
    salary: string;
    worktime: string;
    location: string;
    description: string;
    contact: string;
    requirements?: string;
    createdAt?: string;
    updatedAt?: string;
}

// 餐厅信息类型
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
    locationDescription?: string;
    orderQrCode?: string; // 点餐码图片URL
    orderLink?: string; // 点餐直链URL
    blackCardAccepted?: boolean; // 是否支持黑卡
    menuText?: string; // 菜单文字描述
    menuImages?: string[]; // 菜单图片URL数组
    distance?: number;
    createdAt?: string;
    updatedAt?: string;
}

// 筛选参数类型
export interface FilterParams {
    page?: number;
    limit?: number;
    keyword?: string;
    type?: string;
    [key: string]: any;
}
