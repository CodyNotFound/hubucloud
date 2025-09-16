/**
 * 兼职相关工具函数
 */

/**
 * 联系方式类型
 */
export interface ContactInfo {
    type: 'phone' | 'wechat' | 'mixed';
    phone?: string;
    wechat?: string;
    display: string;
}

/**
 * 解析联系方式字符串
 * 支持格式：
 * - 纯手机号：13812345678
 * - 纯微信号：wechat:xiaoming123
 * - 微信手机同号：13812345678（微信同号）
 * - 手机+微信：13812345678,wechat:xiaoming123
 */
export function parseContact(contact: string): ContactInfo {
    if (!contact || typeof contact !== 'string') {
        return {
            type: 'phone',
            display: contact || '',
        };
    }

    const trimmed = contact.trim();

    // 检查是否为纯手机号（11位数字）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (phoneRegex.test(trimmed)) {
        return {
            type: 'phone',
            phone: trimmed,
            display: trimmed,
        };
    }

    // 检查是否为微信手机同号格式
    const sameNumberRegex = /^(1[3-9]\d{9}).*[（(]?微信同号[）)]?/;
    const sameNumberMatch = trimmed.match(sameNumberRegex);
    if (sameNumberMatch) {
        return {
            type: 'mixed',
            phone: sameNumberMatch[1],
            wechat: sameNumberMatch[1],
            display: trimmed,
        };
    }

    // 检查是否包含wechat:格式
    const wechatRegex = /wechat:([a-zA-Z0-9_-]+)/i;
    const wechatMatch = trimmed.match(wechatRegex);

    // 同时检查是否包含手机号
    const phoneMatch = trimmed.match(/1[3-9]\d{9}/);

    if (wechatMatch && phoneMatch) {
        return {
            type: 'mixed',
            phone: phoneMatch[0],
            wechat: wechatMatch[1],
            display: trimmed,
        };
    } else if (wechatMatch) {
        return {
            type: 'wechat',
            wechat: wechatMatch[1],
            display: trimmed,
        };
    } else if (phoneMatch) {
        return {
            type: 'phone',
            phone: phoneMatch[0],
            display: trimmed,
        };
    }

    // 默认返回原始字符串
    return {
        type: 'phone',
        display: trimmed,
    };
}

/**
 * 验证联系方式格式
 */
export function validateContact(contact: string): { isValid: boolean; error?: string } {
    if (!contact || typeof contact !== 'string' || contact.trim().length === 0) {
        return { isValid: false, error: '联系方式不能为空' };
    }

    const parsed = parseContact(contact);

    // 检查是否至少包含一种有效的联系方式
    if (!parsed.phone && !parsed.wechat) {
        return {
            isValid: false,
            error: '请提供有效的联系方式（手机号或微信号）',
        };
    }

    // 验证手机号格式
    if (parsed.phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(parsed.phone)) {
            return {
                isValid: false,
                error: '手机号格式不正确',
            };
        }
    }

    // 验证微信号格式（6-20位字母数字下划线横线）
    if (parsed.wechat) {
        const wechatRegex = /^[a-zA-Z0-9_-]{6,20}$/;
        if (!wechatRegex.test(parsed.wechat)) {
            return {
                isValid: false,
                error: '微信号格式不正确（6-20位字母数字下划线横线）',
            };
        }
    }

    return { isValid: true };
}

/**
 * 性别要求类型
 */
export type GenderRequirement = 'male' | 'female' | 'no-limit';

/**
 * 解析要求字段中的性别限制
 * 支持格式：
 * - 限男生、仅限男生、男生优先
 * - 限女生、仅限女生、女生优先
 * - 男女不限、性别不限、无性别要求
 */
export function parseGenderRequirement(requirements?: string): {
    gender: GenderRequirement;
    otherRequirements: string;
} {
    if (!requirements || typeof requirements !== 'string') {
        return {
            gender: 'no-limit',
            otherRequirements: '',
        };
    }

    const trimmed = requirements.trim();

    // 检查男生限制关键词
    const maleKeywords = ['限男生', '仅限男生', '男生优先', '只要男生', '招男生'];
    const hasMaleKeyword = maleKeywords.some((keyword) => trimmed.includes(keyword));

    // 检查女生限制关键词
    const femaleKeywords = ['限女生', '仅限女生', '女生优先', '只要女生', '招女生'];
    const hasFemaleKeyword = femaleKeywords.some((keyword) => trimmed.includes(keyword));

    // 检查无限制关键词
    const noLimitKeywords = ['男女不限', '性别不限', '无性别要求', '不限性别'];
    const hasNoLimitKeyword = noLimitKeywords.some((keyword) => trimmed.includes(keyword));

    let gender: GenderRequirement = 'no-limit';
    let cleanedRequirements = trimmed;

    if (hasMaleKeyword && !hasFemaleKeyword) {
        gender = 'male';
        // 移除性别相关关键词
        maleKeywords.forEach((keyword) => {
            cleanedRequirements = cleanedRequirements.replace(new RegExp(keyword, 'g'), '');
        });
    } else if (hasFemaleKeyword && !hasMaleKeyword) {
        gender = 'female';
        // 移除性别相关关键词
        femaleKeywords.forEach((keyword) => {
            cleanedRequirements = cleanedRequirements.replace(new RegExp(keyword, 'g'), '');
        });
    } else if (hasNoLimitKeyword) {
        gender = 'no-limit';
        // 移除性别相关关键词
        noLimitKeywords.forEach((keyword) => {
            cleanedRequirements = cleanedRequirements.replace(new RegExp(keyword, 'g'), '');
        });
    }

    // 清理多余的标点符号和空格
    cleanedRequirements = cleanedRequirements
        .replace(/[，。；、]+/g, '，')
        .replace(/^[，。；、\s]+|[，。；、\s]+$/g, '')
        .trim();

    return {
        gender,
        otherRequirements: cleanedRequirements,
    };
}

/**
 * 验证要求字段格式
 */
export function validateRequirements(requirements?: string): { isValid: boolean; error?: string } {
    if (!requirements) {
        return { isValid: true }; // 要求字段是可选的
    }

    if (typeof requirements !== 'string') {
        return { isValid: false, error: '要求字段必须是文本格式' };
    }

    if (requirements.trim().length > 500) {
        return { isValid: false, error: '要求字段长度不能超过500字符' };
    }

    return { isValid: true };
}

/**
 * 格式化要求字段显示
 */
export function formatRequirements(requirements?: string): string {
    if (!requirements) return '';

    const { gender, otherRequirements } = parseGenderRequirement(requirements);

    const genderText = {
        male: '限男生',
        female: '限女生',
        'no-limit': '',
    }[gender];

    const parts = [genderText, otherRequirements].filter(Boolean);
    return parts.join('，');
}
