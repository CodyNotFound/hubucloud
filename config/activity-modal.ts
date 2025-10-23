/**
 * 活动弹窗配置文件
 * 支持图片和文字两种类型的弹窗内容
 */

export interface ActivityModal {
    /** 弹窗唯一标识 */
    id: string;
    /** 弹窗标题 */
    title: string;
    /** 内容类型 */
    type: 'image' | 'text';
    /** 图片URL（当type为image时使用） */
    imageUrl?: string;
    /** 文字内容（当type为text时使用） */
    content?: string;
    /** 是否自动打开 */
    autoOpen: boolean;
    /** 按钮文字 */
    buttonText?: string;
    /** 是否启用 */
    enabled: boolean;
}

/**
 * 活动弹窗配置列表
 * 可以配置多个弹窗，页面会按照数组顺序显示
 */
export const activityModals: ActivityModal[] = [
    {
        id: 'welcome-activity',
        title: '欢迎参加校园活动',
        type: 'image',
        imageUrl: 'https://via.placeholder.com/600x400?text=校园活动海报',
        autoOpen: true,
        buttonText: '了解详情',
        enabled: true,
    },
    {
        id: 'activity-notice',
        title: '活动通知',
        type: 'text',
        content:
            '本周末将举办校园文化节，欢迎大家积极参与！\n\n时间：本周六 14:00\n地点：学生活动中心\n\n期待您的到来！',
        autoOpen: false,
        buttonText: '查看详情',
        enabled: true,
    },
];
