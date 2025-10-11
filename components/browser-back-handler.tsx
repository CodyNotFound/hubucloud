'use client';

import { useEffect } from 'react';

/**
 * 浏览器返回按钮处理组件
 * 用于解决在微信/QQ内置浏览器中点击返回直接退出的问题
 */
export function BrowserBackHandler() {
    useEffect(() => {
        // 检测是否在微信或QQ内置浏览器中
        const isWeChatOrQQ = /MicroMessenger|QQ\//i.test(navigator.userAgent);

        if (!isWeChatOrQQ) {
            return; // 非微信/QQ浏览器不需要处理
        }

        // 在历史记录中添加一条记录
        const pushHistoryState = () => {
            const state = {
                title: document.title,
                url: window.location.href,
            };
            window.history.pushState(state, '', window.location.href);
        };

        // 初始化：添加一条历史记录
        pushHistoryState();

        // 监听返回事件
        const handlePopState = () => {
            // 用户点击返回时，再次添加历史记录，形成"返回循环"
            pushHistoryState();
        };

        window.addEventListener('popstate', handlePopState);

        // 清理函数
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return null; // 该组件不渲染任何内容
}
