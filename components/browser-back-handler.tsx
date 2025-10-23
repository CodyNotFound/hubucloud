'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 浏览器返回按钮处理组件
 * 用于解决在微信/QQ内置浏览器中点击返回直接退出的问题
 * - 非首页：正常返回上一页
 * - 首页：需要点击两次返回才能退出
 */
export function BrowserBackHandler() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // 检测是否在微信或QQ内置浏览器中
        const isWeChatOrQQ = /MicroMessenger|QQ\//i.test(navigator.userAgent);

        if (!isWeChatOrQQ) {
            return; // 非微信/QQ浏览器不需要处理
        }

        // 在历史记录中添加一条记录
        const state = {
            title: document.title,
            url: window.location.href,
            canGoBack: true,
        };
        window.history.pushState(state, '', window.location.href);

        // 监听返回事件
        const handlePopState = (event: PopStateEvent) => {
            const isHomePage = pathname === '/' || pathname === '';

            if (isHomePage) {
                // 首页：再次添加历史记录，需要点击两次才能退出
                window.history.pushState(state, '', window.location.href);
            } else {
                // 非首页：使用 Next.js router 返回上一页
                event.preventDefault();
                router.back();
            }
        };

        window.addEventListener('popstate', handlePopState);

        // 清理函数
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [pathname, router]);

    return null; // 该组件不渲染任何内容
}
