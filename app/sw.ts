import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

import { CacheFirst, NetworkFirst, NetworkOnly, Serwist } from 'serwist';

// 声明 Service Worker 全局作用域
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    // 预缓存清单，由 Serwist 自动生成
    precacheEntries: self.__SW_MANIFEST,
    // 立即激活新的 Service Worker，自动更新
    skipWaiting: true,
    // 立即接管所有客户端
    clientsClaim: true,
    // 启用导航预加载
    navigationPreload: true,
    // 运行时缓存策略
    runtimeCaching: [
        // 1. 页面导航请求 - NetworkFirst 策略
        {
            matcher: ({ request, url }) =>
                request.mode === 'navigate' && !url.pathname.startsWith('/admin'),
            handler: new NetworkFirst({
                cacheName: 'pages-cache',
                networkTimeoutSeconds: 3,
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            return response.status === 200 ? response : null;
                        },
                    },
                ],
            }),
        },
        // 2. 静态资源（JS、CSS）- CacheFirst 策略
        {
            matcher: ({ request, url }) =>
                (request.destination === 'script' || request.destination === 'style') &&
                !url.pathname.startsWith('/admin'),
            handler: new CacheFirst({
                cacheName: 'static-resources',
            }),
        },
        // 3. 图片资源 - CacheFirst 策略（图片永不变更）
        {
            matcher: ({ request, url }) =>
                request.destination === 'image' && !url.pathname.startsWith('/admin'),
            handler: new CacheFirst({
                cacheName: 'images-cache',
            }),
        },
        // 4. 字体文件 - CacheFirst 策略
        {
            matcher: ({ request, url }) =>
                request.destination === 'font' && !url.pathname.startsWith('/admin'),
            handler: new CacheFirst({
                cacheName: 'fonts-cache',
            }),
        },
        // 5. API 请求 - NetworkOnly 策略（不缓存）
        {
            matcher: ({ url }) => url.pathname.startsWith('/api/'),
            handler: new NetworkOnly(),
        },
        // 6. 用户上传的图片 - CacheFirst 策略（图片永不变更）
        {
            matcher: ({ url }) =>
                url.pathname.startsWith('/uploads/') && !url.pathname.startsWith('/admin'),
            handler: new CacheFirst({
                cacheName: 'user-uploads-cache',
            }),
        },
    ],
});

// 添加事件监听器
serwist.addEventListeners();
