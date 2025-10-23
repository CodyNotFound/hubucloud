/**
 * 餐厅搜索工具函数
 * 支持：中文、拼音、同音字、模糊搜索
 */

import Fuse from 'fuse.js';
import PinyinMatch from 'pinyin-match';
import { pinyin } from 'pinyin-pro';

import { RestaurantSearchItem } from '@/types/restaurant';

/**
 * 将文本转换为拼音（用于同音字匹配）
 * @param text 原始文本
 * @returns 拼音字符串（小写，无声调）
 */
function toPinyin(text: string): string {
    return pinyin(text, { toneType: 'none', type: 'array' })
        .join('')
        .toLowerCase()
        .replace(/\s+/g, '');
}

/**
 * 检查两个文本的拼音是否相似（同音字匹配）
 * @param text1 文本1
 * @param text2 文本2
 * @returns 是否相似
 */
function isSimilarPinyin(text1: string, text2: string): boolean {
    const pinyin1 = toPinyin(text1);
    const pinyin2 = toPinyin(text2);

    // 完全匹配
    if (pinyin1 === pinyin2) return true;

    // 包含匹配
    if (pinyin1.includes(pinyin2) || pinyin2.includes(pinyin1)) return true;

    // 计算编辑距离（允许少量差异）
    const distance = levenshteinDistance(pinyin1, pinyin2);
    const maxLen = Math.max(pinyin1.length, pinyin2.length);
    const similarity = 1 - distance / maxLen;

    // 相似度 > 70% 认为是同音字
    return similarity > 0.7;
}

/**
 * 计算编辑距离（Levenshtein Distance）
 */
function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp: number[][] = Array(len1 + 1)
        .fill(0)
        .map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
            }
        }
    }

    return dp[len1][len2];
}

/**
 * 搜索餐厅（支持中文、拼音、同音字、模糊搜索）
 * @param keyword 搜索关键词
 * @param restaurants 餐厅搜索数据列表
 * @returns 匹配的餐厅ID列表（按相关性排序）
 */
export function searchRestaurants(keyword: string, restaurants: RestaurantSearchItem[]): string[] {
    if (!keyword || !keyword.trim()) {
        return [];
    }

    const trimmedKeyword = keyword.trim().toLowerCase();
    const matchedSet = new Set<string>();
    const matchedWithScore: Array<{ id: string; score: number }> = [];

    // 策略 1: 直接包含匹配（最高优先级，得分 100）
    for (const restaurant of restaurants) {
        const name = restaurant.name.toLowerCase();
        const location = restaurant.locationDescription?.toLowerCase() || '';
        const menu = restaurant.menuText?.toLowerCase() || '';

        if (name.includes(trimmedKeyword)) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 100 });
            continue;
        }

        if (location.includes(trimmedKeyword)) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 95 });
            continue;
        }

        // 标签匹配
        if (restaurant.tags?.some((tag) => tag.toLowerCase().includes(trimmedKeyword))) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 90 });
            continue;
        }

        // 菜单文本匹配
        if (menu.includes(trimmedKeyword)) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 85 });
        }
    }

    // 策略 2: 拼音匹配（高优先级）
    for (const restaurant of restaurants) {
        if (matchedSet.has(restaurant.id)) continue;

        // 餐厅名称拼音匹配
        if (PinyinMatch.match(restaurant.name, trimmedKeyword)) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 85 });
            continue;
        }

        // 位置描述拼音匹配
        if (
            restaurant.locationDescription &&
            PinyinMatch.match(restaurant.locationDescription, trimmedKeyword)
        ) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 80 });
            continue;
        }

        // 标签拼音匹配
        if (restaurant.tags?.some((tag) => PinyinMatch.match(tag, trimmedKeyword))) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 75 });
            continue;
        }

        // 菜单文本拼音匹配
        if (restaurant.menuText && PinyinMatch.match(restaurant.menuText, trimmedKeyword)) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 70 });
        }
    }

    // 策略 3: 同音字匹配（中优先级）
    for (const restaurant of restaurants) {
        if (matchedSet.has(restaurant.id)) continue;

        // 餐厅名称同音字匹配
        if (isSimilarPinyin(restaurant.name, trimmedKeyword)) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 70 });
            continue;
        }

        // 位置描述同音字匹配
        if (
            restaurant.locationDescription &&
            isSimilarPinyin(restaurant.locationDescription, trimmedKeyword)
        ) {
            matchedSet.add(restaurant.id);
            matchedWithScore.push({ id: restaurant.id, score: 65 });
        }
    }

    // 策略 4: Fuse.js 模糊搜索（低优先级，兜底）
    const fuse = new Fuse(restaurants, {
        keys: [
            { name: 'name', weight: 2 },
            { name: 'locationDescription', weight: 1.5 },
            { name: 'tags', weight: 1 },
            { name: 'menuText', weight: 1.2 },
        ],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        ignoreLocation: true,
    });

    const fuseResults = fuse.search(trimmedKeyword);

    for (const result of fuseResults) {
        const id = result.item.id;
        if (!matchedSet.has(id)) {
            const score = Math.round((1 - (result.score || 0)) * 60);
            matchedSet.add(id);
            matchedWithScore.push({ id, score });
        }
    }

    // 按得分降序排序
    matchedWithScore.sort((a, b) => b.score - a.score);

    return matchedWithScore.map((item) => item.id);
}

/**
 * 按类型过滤餐厅
 * @param restaurants 餐厅搜索数据列表
 * @param type 餐厅类型
 * @returns 过滤后的餐厅列表
 */
export function filterRestaurantsByType(
    restaurants: RestaurantSearchItem[],
    type: string
): RestaurantSearchItem[] {
    if (!type || type === '全部') {
        return restaurants;
    }

    return restaurants.filter((restaurant) => restaurant.type === type);
}

/**
 * 本地搜索缓存键
 */
export const SEARCH_DATA_CACHE_KEY = 'hubu_restaurants_search_data';
export const SEARCH_DATA_CACHE_VERSION = '1.0';
export const SEARCH_DATA_CACHE_VERSION_KEY = 'hubu_restaurants_search_data_version';

/**
 * 获取缓存的搜索数据
 */
export function getCachedSearchData(): RestaurantSearchItem[] | null {
    try {
        // 检查是否在浏览器环境
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return null;
        }

        const version = localStorage.getItem(SEARCH_DATA_CACHE_VERSION_KEY);
        if (version !== SEARCH_DATA_CACHE_VERSION) {
            // 版本不匹配，清除缓存
            localStorage.removeItem(SEARCH_DATA_CACHE_KEY);
            localStorage.removeItem(SEARCH_DATA_CACHE_VERSION_KEY);
            return null;
        }

        const cached = localStorage.getItem(SEARCH_DATA_CACHE_KEY);
        if (!cached) {
            return null;
        }

        const data = JSON.parse(cached) as RestaurantSearchItem[];
        return data;
    } catch (error) {
        console.error('读取搜索数据缓存失败:', error);
        return null;
    }
}

/**
 * 设置搜索数据缓存
 */
export function setCachedSearchData(data: RestaurantSearchItem[]): void {
    try {
        // 检查是否在浏览器环境
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }

        localStorage.setItem(SEARCH_DATA_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(SEARCH_DATA_CACHE_VERSION_KEY, SEARCH_DATA_CACHE_VERSION);
    } catch (error) {
        console.error('设置搜索数据缓存失败:', error);
    }
}
