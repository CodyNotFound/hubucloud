/**
 * 配置项类型定义
 */
export interface Config {
    id: string;
    key: string;
    value: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * 配置表单数据类型
 */
export interface ConfigFormData {
    key: string;
    value: string;
    description?: string;
}

/**
 * 美食口令响应类型
 */
export interface FoodPasswordResponse {
    available: boolean;
    password: string | null;
    message: string;
    description?: string | null;
}
