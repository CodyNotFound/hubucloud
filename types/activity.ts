/**
 * 活动类型定义（简化版 - 朋友圈风格）
 */

export interface Activity {
    id: string;
    content: string;
    images: string[];
    enabled: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ActivityFormData {
    content: string;
    images: string[];
    enabled: boolean;
}
