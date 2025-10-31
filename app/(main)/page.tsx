'use client';

import type { Activity } from '@/types/activity';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    MessageSquare,
    UtensilsCrossed,
    Package,
    Briefcase,
    Car,
    GraduationCap,
    Building2,
    Wifi,
    Calendar,
    X,
    EyeOff,
    Home as HomeIcon,
    Gamepad2,
    Sparkles,
} from 'lucide-react';
import { Modal, ModalContent, ModalBody, Button, useDisclosure } from '@heroui/react';

import { HeroCarousel } from '@/components/hero-carousel';
import { ImageViewer } from '@/components/common/image-viewer';
import { CampusNetworkPrompt } from '@/components/common/campus-network-prompt';
import { useMiniappMode } from '@/hooks/useMiniappMode';

const STORAGE_KEY_PREFIX = 'activity_hidden_';
const STORAGE_KEY_LAST_SHOWN = 'activity_last_shown_';

const services = [
    {
        href: 'http://122.204.223.188/',
        icon: Wifi,
        title: '校园网登录',
        description: '校园网络认证',
        color: 'bg-sky-50 hover:bg-sky-100 text-sky-600',
    },
    {
        href: 'https://sso.hubu.edu.cn/lyuapServer/login?service=https%3A%2F%2Fjwxt.hubu.edu.cn%2Fsso.jsp',
        icon: GraduationCap,
        title: '教务系统',
        description: '学生教务管理',
        color: 'bg-teal-50 hover:bg-teal-100 text-teal-600',
    },
    {
        href: 'https://one.hubu.edu.cn/#/index51',
        icon: Building2,
        title: '智慧琴园',
        description: '校园服务平台',
        color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-600',
    },
    {
        href: '/activity',
        icon: Calendar,
        title: '活动专区',
        description: '萧云活动',
        color: 'bg-rose-50 hover:bg-rose-100 text-rose-600',
    },
    {
        href: '/forum',
        icon: MessageSquare,
        title: '论坛',
        description: '学术讨论与交流',
        color: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    },
    {
        href: '/food',
        icon: UtensilsCrossed,
        title: '美食',
        description: '校园周边美食',
        color: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
    },
    {
        href: '/life',
        icon: HomeIcon,
        title: '生活',
        description: '生活好物推荐',
        color: 'bg-amber-50 hover:bg-amber-100 text-amber-600',
    },
    {
        href: '/entertainment',
        icon: Gamepad2,
        title: '娱乐',
        description: '放松身心好去处',
        color: 'bg-violet-50 hover:bg-violet-100 text-violet-600',
    },
    {
        href: '/jobs',
        icon: Briefcase,
        title: '兼职',
        description: '校园兼职招聘',
        color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600',
    },
    {
        href: '/card',
        icon: Package,
        title: '黑卡',
        description: '黑卡相关服务',
        color: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
    },
    {
        href: '/drivingschool',
        icon: Car,
        title: '驾校',
        description: '驾校报名服务',
        color: 'bg-green-50 hover:bg-green-100 text-green-600',
    },
    {
        href: '#',
        icon: Sparkles,
        title: '到梦空间',
        description: '校园活动',
        color: 'bg-pink-50 hover:bg-pink-100 text-pink-600',
        isComingSoon: true,
    },
];

export default function Home() {
    const [modalActivity, setModalActivity] = useState<Activity | null>(null);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isComingSoonOpen,
        onOpen: onComingSoonOpen,
        onClose: onComingSoonClose,
    } = useDisclosure();
    const { isMiniappMode } = useMiniappMode();

    // 根据小程序模式过滤服务
    const filteredServices = isMiniappMode
        ? services.filter(
              (service) =>
                  !service.href.startsWith('http://') && !service.href.startsWith('https://')
          )
        : services;

    useEffect(() => {
        // 首页加载时检查是否需要显示活动弹窗
        fetchAndShowActivity();
    }, []);

    const fetchAndShowActivity = async () => {
        try {
            const response = await fetch('/api/activity');
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                const enabledActivities = result.data.filter((a: Activity) => a.enabled);
                checkAndShowModal(enabledActivities);
            }
        } catch (error) {
            console.error('获取活动失败:', error);
        }
    };

    // 检查并显示弹窗
    const checkAndShowModal = (acts: Activity[]) => {
        if (acts.length === 0) return;

        const now = Date.now();
        const today = new Date().toDateString();

        for (const activity of acts) {
            // 检查是否在七天内隐藏
            const hiddenUntil = localStorage.getItem(STORAGE_KEY_PREFIX + activity.id);
            if (hiddenUntil) {
                const hiddenUntilTime = parseInt(hiddenUntil);
                if (now < hiddenUntilTime) continue; // 仍在隐藏期内
            }

            // 检查今天是否已显示过
            const lastShown = localStorage.getItem(STORAGE_KEY_LAST_SHOWN + activity.id);
            const lastShownDate = lastShown ? new Date(parseInt(lastShown)).toDateString() : null;

            if (lastShownDate !== today) {
                // 记录本次显示时间
                localStorage.setItem(STORAGE_KEY_LAST_SHOWN + activity.id, now.toString());
                // 显示弹窗
                setModalActivity(activity);
                break;
            }
        }
    };

    // 七天内不再显示
    const handleHideForSevenDays = (activityId: string) => {
        const now = Date.now();
        const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000; // 7天后的时间戳
        localStorage.setItem(STORAGE_KEY_PREFIX + activityId, sevenDaysLater.toString());
        setModalActivity(null);
    };

    // 处理外部链接点击
    const handleServiceClick = (e: React.MouseEvent, href: string, isComingSoon?: boolean) => {
        // 处理"开发中"功能
        if (isComingSoon) {
            e.preventDefault();
            onComingSoonOpen();
            return;
        }
        // 判断是否为外部链接
        if (href.startsWith('http://') || href.startsWith('https://')) {
            e.preventDefault();
            // 只有校园网登录需要提示
            if (href.startsWith('http://122.204.223.188/')) {
                setPendingUrl(href);
                onOpen();
            } else {
                // 其他外部链接直接打开
                window.open(href, '_blank');
            }
        }
    };

    // 确认跳转
    const handleConfirmNavigation = () => {
        if (pendingUrl) {
            window.open(pendingUrl, '_blank');
            setPendingUrl(null);
        }
    };

    return (
        <>
            <div className="min-h-full">
                {/* 轮播图区域 */}
                <section className="w-full mb-6 md:mb-8 lg:mb-12">
                    <div className="max-w-7xl mx-auto">
                        <HeroCarousel />
                    </div>
                </section>

                {/* 服务网格区域 */}
                <section className="w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-6 md:mb-8 lg:mb-12">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                                校园服务
                            </h2>
                            <p className="text-sm md:text-base lg:text-lg text-default-600">
                                为湖大学子提供便捷的校园生活服务
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                            {filteredServices.map((service) => {
                                const IconComponent = service.icon;

                                return (
                                    <Link
                                        key={service.href}
                                        href={service.href}
                                        onClick={(e) =>
                                            handleServiceClick(
                                                e,
                                                service.href,
                                                (service as any).isComingSoon
                                            )
                                        }
                                        className={`
                                            rounded-xl p-4 md:p-6 lg:p-8 text-center
                                            transition-all duration-300
                                            hover:shadow-lg hover:scale-105
                                            bg-default-50 hover:bg-default-100
                                            group
                                        `}
                                    >
                                        <div className="flex flex-col items-center space-y-2 md:space-y-3 lg:space-y-4">
                                            <div
                                                className={`
                                                p-3 md:p-4 lg:p-5 rounded-full
                                                ${service.color}
                                                transition-all duration-300
                                                group-hover:scale-110
                                            `}
                                            >
                                                <IconComponent
                                                    size={24}
                                                    className="md:w-6 md:h-6 lg:w-8 lg:h-8"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-1">
                                                    {service.title}
                                                </h3>
                                                <p className="text-xs md:text-sm lg:text-base text-default-600">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {/* 活动自动弹窗 */}
            {modalActivity && (
                <Modal
                    isOpen={true}
                    onClose={() => setModalActivity(null)}
                    size="2xl"
                    scrollBehavior="inside"
                    hideCloseButton
                    classNames={{
                        base: 'mx-4 mt-16',
                        body: 'p-4',
                    }}
                >
                    <ModalContent>
                        <ModalBody>
                            {/* 关闭按钮 */}
                            <div className="flex justify-end mb-2">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => setModalActivity(null)}
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* 内容 */}
                            <div className="space-y-4">
                                <p className="text-default-700 whitespace-pre-wrap">
                                    {modalActivity.content}
                                </p>

                                {/* 图片 */}
                                {modalActivity.images.length > 0 && (
                                    <div
                                        className={`grid gap-2 ${
                                            modalActivity.images.length === 1
                                                ? 'grid-cols-1'
                                                : modalActivity.images.length === 2 ||
                                                    modalActivity.images.length === 4
                                                  ? 'grid-cols-2'
                                                  : 'grid-cols-3'
                                        }`}
                                    >
                                        {modalActivity.images.map((img, index) => (
                                            <ImageViewer
                                                key={index}
                                                src={img}
                                                alt={`活动图片 ${index + 1}`}
                                                thumbnailClassName="rounded-lg aspect-square"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 底部按钮 */}
                            <div className="flex gap-2 mt-6">
                                <Button
                                    variant="flat"
                                    color="default"
                                    className="flex-1"
                                    startContent={<EyeOff size={16} />}
                                    onPress={() => handleHideForSevenDays(modalActivity.id)}
                                >
                                    七天内不再显示
                                </Button>
                                <Button
                                    color="primary"
                                    className="flex-1"
                                    onPress={() => setModalActivity(null)}
                                >
                                    知道了
                                </Button>
                            </div>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}

            {/* 校园网提示弹窗 */}
            <CampusNetworkPrompt
                isOpen={isOpen}
                onClose={onClose}
                onConfirm={handleConfirmNavigation}
                targetUrl={pendingUrl || undefined}
            />

            {/* 开发中提示弹窗 */}
            <Modal isOpen={isComingSoonOpen} onClose={onComingSoonClose} size="sm">
                <ModalContent>
                    <ModalBody className="py-6">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 bg-pink-50 rounded-full">
                                    <Sparkles size={32} className="text-pink-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">功能开发中</h3>
                                <p className="text-default-600 text-sm">敬请期待...</p>
                            </div>
                            <Button color="primary" onPress={onComingSoonClose} className="w-full">
                                知道了
                            </Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
