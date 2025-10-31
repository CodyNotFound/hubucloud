'use client';

import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Download, Smartphone, Share } from 'lucide-react';

import { useMiniappMode } from '@/hooks/useMiniappMode';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { isMiniappMode } = useMiniappMode();

    useEffect(() => {
        // 检测是否是 iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // 检测是否已经是独立应用模式
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // 如果已经安装，不显示
        if (standalone) return;

        // Android: 监听 beforeinstallprompt 事件
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log('beforeinstallprompt 事件被触发');
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);

            // 检查是否应该显示引导（实时读取 localStorage）
            const hasPrompted = localStorage.getItem('pwa-install-prompted');
            const installDismissed = localStorage.getItem('pwa-install-dismissed');

            if (!hasPrompted && !installDismissed) {
                setTimeout(() => {
                    setShowGuide(true);
                    localStorage.setItem('pwa-install-prompted', 'true');
                }, 3000); // 3秒后显示
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS: 首次访问显示引导
        if (ios) {
            const hasPrompted = localStorage.getItem('pwa-install-prompted');
            const installDismissed = localStorage.getItem('pwa-install-dismissed');

            if (!hasPrompted && !installDismissed) {
                setTimeout(() => {
                    setShowGuide(true);
                    localStorage.setItem('pwa-install-prompted', 'true');
                }, 3000);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Android: 触发安装提示
    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.log('deferredPrompt 不可用');
            alert('请使用浏览器菜单中的「添加到主屏幕」功能');
            return;
        }

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log('安装结果:', outcome);

            if (outcome === 'accepted') {
                console.log('用户接受了安装');
            } else {
                localStorage.setItem('pwa-install-dismissed', 'true');
            }

            setDeferredPrompt(null);
            setShowGuide(false);
        } catch (error) {
            console.error('安装过程出错:', error);
            alert('安装失败，请使用浏览器菜单中的「添加到主屏幕」功能');
        }
    };

    // 关闭引导
    const handleDismiss = () => {
        setShowGuide(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // 如果是小程序模式或已经是独立应用模式，不显示任何内容
    if (isMiniappMode || isStandalone) return null;

    return (
        <>
            {/* 首次访问引导弹窗 */}
            <Modal
                isOpen={showGuide}
                onClose={handleDismiss}
                size="md"
                placement="bottom"
                backdrop="blur"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-success" />
                            <span>添加到桌面</span>
                        </div>
                    </ModalHeader>
                    <ModalBody className="pb-6">
                        <div className="space-y-4">
                            <p className="text-sm text-default-600">
                                将「湖大萧云」添加到桌面，获得更好的使用体验：
                            </p>
                            <ul className="space-y-2 text-sm text-default-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-success mt-0.5">✓</span>
                                    <span>快速启动，无需打开浏览器</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success mt-0.5">✓</span>
                                    <span>全屏体验，就像原生应用</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success mt-0.5">✓</span>
                                    <span>离线访问，随时随地使用</span>
                                </li>
                            </ul>

                            {isIOS ? (
                                <Card className="bg-default-100">
                                    <CardBody className="py-3">
                                        <p className="text-xs text-default-600 mb-2 font-medium">
                                            iOS 安装步骤：
                                        </p>
                                        <ol className="space-y-1.5 text-xs text-default-700">
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">1.</span>
                                                <span>
                                                    点击底部工具栏的{' '}
                                                    <Share className="inline w-3 h-3 mx-0.5" />{' '}
                                                    分享按钮
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">2.</span>
                                                <span>向下滚动，找到「添加到主屏幕」</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">3.</span>
                                                <span>点击「添加」完成安装</span>
                                            </li>
                                        </ol>
                                    </CardBody>
                                </Card>
                            ) : deferredPrompt ? (
                                <Button
                                    color="success"
                                    size="lg"
                                    className="w-full"
                                    startContent={<Download className="w-4 h-4" />}
                                    onPress={handleInstallClick}
                                >
                                    立即安装
                                </Button>
                            ) : (
                                <Card className="bg-default-100">
                                    <CardBody className="py-3">
                                        <p className="text-xs text-default-600 mb-2 font-medium">
                                            Android 安装步骤：
                                        </p>
                                        <ol className="space-y-1.5 text-xs text-default-700">
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">1.</span>
                                                <span>点击浏览器右上角菜单（⋮）</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">2.</span>
                                                <span>选择「添加到主屏幕」或「安装应用」</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-semibold">3.</span>
                                                <span>点击「安装」完成</span>
                                            </li>
                                        </ol>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

// 导出一个可以在任何地方触发的安装按钮组件
export function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { isMiniappMode } = useMiniappMode();

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }

        if (!deferredPrompt) {
            alert('请使用浏览器菜单中的「添加到主屏幕」功能');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('用户接受了安装');
        }

        setDeferredPrompt(null);
    };

    // 如果是小程序模式或已经是独立应用，不显示按钮
    if (isMiniappMode || isStandalone) return null;

    return (
        <>
            <Button
                color="success"
                variant="flat"
                size="sm"
                startContent={<Download className="w-4 h-4" />}
                onPress={handleInstall}
            >
                添加到桌面
            </Button>

            {/* iOS 引导弹窗 */}
            <Modal isOpen={showIOSGuide} onClose={() => setShowIOSGuide(false)} size="sm">
                <ModalContent>
                    <ModalHeader>iOS 安装指南</ModalHeader>
                    <ModalBody>
                        <ol className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">1.</span>
                                <span>点击底部工具栏的 分享 按钮</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">2.</span>
                                <span>向下滚动，找到「添加到主屏幕」</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">3.</span>
                                <span>点击「添加」完成安装</span>
                            </li>
                        </ol>
                    </ModalBody>
                    <ModalFooter>
                        <Button onPress={() => setShowIOSGuide(false)}>知道了</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
