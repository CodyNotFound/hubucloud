export interface ContactInfo {
    type: 'phone' | 'wechat' | 'mixed';
    phone?: string;
    wechat?: string;
    display: string;
}

export function parseContact(contact: string): ContactInfo {
    if (!contact || typeof contact !== 'string') {
        return {
            type: 'phone',
            display: contact || '',
        };
    }

    const trimmed = contact.trim();

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (phoneRegex.test(trimmed)) {
        return {
            type: 'phone',
            phone: trimmed,
            display: trimmed,
        };
    }

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

    const wechatRegex = /wechat:([a-zA-Z0-9_-]+)/i;
    const wechatMatch = trimmed.match(wechatRegex);
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

    return {
        type: 'phone',
        display: trimmed,
    };
}

export function validateContact(contact: string): { isValid: boolean; error?: string } {
    if (!contact || typeof contact !== 'string' || contact.trim().length === 0) {
        return { isValid: false, error: '联系方式不能为空' };
    }

    const parsed = parseContact(contact);

    if (!parsed.phone && !parsed.wechat) {
        return {
            isValid: false,
            error: '请提供有效的联系方式（手机号或微信号）',
        };
    }

    if (parsed.phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(parsed.phone)) {
            return {
                isValid: false,
                error: '手机号格式不正确',
            };
        }
    }

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

export type GenderRequirement = 'male' | 'female' | 'no-limit';

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

    const maleKeywords = ['限男生', '仅限男生', '男生优先', '只要男生', '招男生'];
    const hasMaleKeyword = maleKeywords.some((keyword) => trimmed.includes(keyword));

    const femaleKeywords = ['限女生', '仅限女生', '女生优先', '只要女生', '招女生'];
    const hasFemaleKeyword = femaleKeywords.some((keyword) => trimmed.includes(keyword));

    const noLimitKeywords = ['男女不限', '性别不限', '无性别要求', '不限性别'];
    const hasNoLimitKeyword = noLimitKeywords.some((keyword) => trimmed.includes(keyword));

    let gender: GenderRequirement = 'no-limit';
    let cleanedRequirements = trimmed;

    if (hasMaleKeyword && !hasFemaleKeyword) {
        gender = 'male';
        maleKeywords.forEach((keyword) => {
            cleanedRequirements = cleanedRequirements.replace(new RegExp(keyword, 'g'), '');
        });
    } else if (hasFemaleKeyword && !hasMaleKeyword) {
        gender = 'female';
        femaleKeywords.forEach((keyword) => {
            cleanedRequirements = cleanedRequirements.replace(new RegExp(keyword, 'g'), '');
        });
    } else if (hasNoLimitKeyword) {
        gender = 'no-limit';
        noLimitKeywords.forEach((keyword) => {
            cleanedRequirements = cleanedRequirements.replace(new RegExp(keyword, 'g'), '');
        });
    }

    cleanedRequirements = cleanedRequirements
        .replace(/[，。；、]+/g, '，')
        .replace(/^[，。；、\s]+|[，。；、\s]+$/g, '')
        .trim();

    return {
        gender,
        otherRequirements: cleanedRequirements,
    };
}

export function validateRequirements(requirements?: string): { isValid: boolean; error?: string } {
    if (!requirements) {
        return { isValid: true };
    }

    if (typeof requirements !== 'string') {
        return { isValid: false, error: '要求字段必须是文本格式' };
    }

    if (requirements.trim().length > 500) {
        return { isValid: false, error: '要求字段长度不能超过500字符' };
    }

    return { isValid: true };
}
