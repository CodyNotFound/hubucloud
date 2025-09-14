/**
 * 兼职相关类型定义
 */

export interface Parttime {
    id: string;
    name: string;
    type: string;
    salary: string;
    time: string;
    location: string;
    description: string;
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateParttimeData {
    name: string;
    type: string;
    salary: string;
    time: string;
    location: string;
    description: string;
    tags: string[];
}

export interface UpdateParttimeData {
    name?: string;
    type?: string;
    salary?: string;
    time?: string;
    location?: string;
    description?: string;
    tags?: string[];
}

export interface ParttimeQuery {
    page?: number;
    limit?: number;
    type?: string;
    location?: string;
    tags?: string;
    keyword?: string;
}
