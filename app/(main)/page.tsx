import Link from 'next/link';
import {
    MessageSquare,
    UtensilsCrossed,
    Package,
    Briefcase,
    Car,
} from 'lucide-react';

import { HeroCarousel } from '@/components/hero-carousel';

const services = [
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
        href: '/unicom',
        icon: Package,
        title: '联通',
        description: '联通业务办理',
        color: 'bg-red-50 hover:bg-red-100 text-red-600',
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
    return (
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
    );
}
