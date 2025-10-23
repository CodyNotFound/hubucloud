/**
 * 兼职相关类型定义
 */

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

export interface CreateParttimeData {
    name: string;
    type: string;
    salary: string;
    worktime: string;
    location: string;
    description: string;
    contact: string;
    requirements?: string;
}

export interface UpdateParttimeData {
    name?: string;
    type?: string;
    salary?: string;
    worktime?: string;
    location?: string;
    description?: string;
    contact?: string;
    requirements?: string;
}

export interface ParttimeQuery {
    page?: number;
    limit?: number;
    type?: string;
    location?: string;
    keyword?: string;
}
