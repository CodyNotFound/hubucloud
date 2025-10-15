'use client';

import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';

export function SWAutoUpdate() {
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        // 只在生产环境且浏览器支持 Service Worker 时运行
        if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
            return;
        }

        const handleUpdate = async () => {
            try {
                // 注册 Service Worker
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                });

                console.log('Service Worker 注册成功:', registration.scope);

                // 等待 Service Worker 准备就绪
                await navigator.serviceWorker.ready;

                // 监听新的 Service Worker 安装
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    // 显示更新提示
                    setIsUpdating(true);

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            // 新的 Service Worker 已激活，延迟一点再刷新页面
                            setTimeout(() => {
                                window.location.reload();
                            }, 500);
                        }
                    });
                });

                // 监听控制器变化（Service Worker 已更换）
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    // 显示更新提示
                    setIsUpdating(true);
                    // 短暂延迟后刷新页面
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                });

                // 定期检查更新（每小时）
                const interval = setInterval(
                    async () => {
                        await registration.update();
                    },
                    60 * 60 * 1000
                );

                return () => clearInterval(interval);
            } catch (error) {
                console.error('Service Worker 更新检查失败:', error);
            }
        };

        handleUpdate();
    }, []);

    return (
        <Modal
            isOpen={isUpdating}
            isDismissable={false}
            hideCloseButton
            size="sm"
            backdrop="opaque"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">正在更新</ModalHeader>
                <ModalBody className="flex flex-col items-center py-6">
                    <Spinner size="lg" color="success" />
                    <p className="mt-4 text-center text-default-600">
                        检测到新版本，正在自动更新...
                    </p>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
