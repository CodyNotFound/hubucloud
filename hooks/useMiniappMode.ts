'use client';

import { useEffect, useState } from 'react';

const MINIAPP_STORAGE_KEY = 'miniapp_mode';

/**
 * 小程序模式 Hook
 * 用于检测和管理小程序模式状态
 */
export function useMiniappMode() {
    const [isMiniappMode, setIsMiniappMode] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // 检查 localStorage 中是否已有小程序模式标记
        const storedMode = localStorage.getItem(MINIAPP_STORAGE_KEY);

        if (storedMode === 'true') {
            setIsMiniappMode(true);
            setIsInitialized(true);
            return;
        }

        // 检查 URL 参数
        const urlParams = new URLSearchParams(window.location.search);
        const miniappParam = urlParams.get('miniapp');

        if (miniappParam === 'true') {
            // 存储到 localStorage
            localStorage.setItem(MINIAPP_STORAGE_KEY, 'true');
            setIsMiniappMode(true);

            // 移除 URL 参数（保持 URL 整洁）
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('miniapp');
            window.history.replaceState({}, '', newUrl.toString());
        }

        setIsInitialized(true);
    }, []);

    return { isMiniappMode, isInitialized };
}

/**
 * 检查是否为小程序模式（同步方法）
 * 用于非 React 组件中
 */
export function checkMiniappMode(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(MINIAPP_STORAGE_KEY) === 'true';
}

/**
 * 设置小程序模式
 */
export function setMiniappMode(enabled: boolean) {
    if (typeof window === 'undefined') return;

    if (enabled) {
        localStorage.setItem(MINIAPP_STORAGE_KEY, 'true');
    } else {
        localStorage.removeItem(MINIAPP_STORAGE_KEY);
    }
}
