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
} from 'lucide-react';
import { Modal, ModalContent, ModalBody, Button } from '@heroui/react';

import { HeroCarousel } from '@/components/hero-carousel';
import { ImageViewer } from '@/components/common/image-viewer';

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
];

export default function Home() {
    const [modalActivity, setModalActivity] = useState<Activity | null>(null);

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
                            {services.map((service) => {
                                const IconComponent = service.icon;

                                return (
                                    <Link
                                        key={service.href}
                                        href={service.href}
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
                    classNames={{
                        base: 'mx-4',
                    }}
                >
                    <ModalContent>
                        <ModalBody className="p-6">
                            {/* 头部 */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                                        湖
                                    </div>
                                    <div>
                                        <p className="font-semibold">湖大萧云</p>
                                        <p className="text-xs text-default-500">
                                            {new Date(modalActivity.createdAt).toLocaleString(
                                                'zh-CN'
                                            )}
                                        </p>
                                    </div>
                                </div>
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
        </>
    );
}
