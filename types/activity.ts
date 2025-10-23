/**
 * 活动类型定义（简化版 - 朋友圈风格）
 */

export interface Activity {
    id: string;
    title: string;
    content: string;
    images: string[];
    enabled: boolean;
    type?: 'IMAGE' | 'TEXT';
    imageUrl?: string;
    buttonText?: string;
    autoOpen?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ActivityFormData {
    title: string;
    content: string;
    images: string[];
    enabled: boolean;
    type?: 'IMAGE' | 'TEXT';
    imageUrl?: string;
    buttonText?: string;
    autoOpen?: boolean;
}
