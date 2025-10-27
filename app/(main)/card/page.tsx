'use client';

import { useState, useRef } from 'react';
import { Spinner } from '@heroui/spinner';
import { Utensils, Home, Play } from 'lucide-react';

// 总页数
const TOTAL_PAGES = 49;

// 悬浮菜单项配置 - 低调优雅的配色方案
const menuItems = [
    { icon: Utensils, label: '美食区', page: 2, color: 'default', textLabel: '美食' },
    { icon: Home, label: '生活区', page: 32, color: 'default', textLabel: '生活' },
    { icon: Play, label: '娱乐区', page: 41, color: 'default', textLabel: '娱乐' },
];

export default function CardPage() {
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const handleImageLoad = (pageNumber: number) => {
        setLoadedImages((prev) => {
            const newSet = new Set(prev);
            newSet.add(pageNumber);
            return newSet;
        });
    };

    const scrollToPage = (pageNumber: number) => {
        const pageElement = pageRefs.current[pageNumber];
        if (pageElement) {
            pageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <div className="scrollbar-hide overflow-auto">
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* 页面标题 */}
            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">萧云黑卡权益一览</h2>
                </div>
            </section>

            {/* 图片展示区域 - 移动端纵向滚动，电脑端双栏布局 */}
            <section className="w-full">
                <div className="w-full max-w-full overflow-hidden space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    {Array.from({ length: TOTAL_PAGES }, (_, index) => {
                        const pageNumber = index + 1;
                        return (
                            <div
                                key={`page_${pageNumber}`}
                                ref={(el) => {
                                    pageRefs.current[pageNumber] = el;
                                }}
                                className="w-full flex justify-center relative"
                            >
                                {!loadedImages.has(pageNumber) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-default-100 rounded-lg">
                                        <Spinner size="lg" />
                                    </div>
                                )}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/card-images/page-${pageNumber}.webp`}
                                    alt={`黑卡权益第 ${pageNumber} 页`}
                                    className="w-full h-auto rounded-lg"
                                    loading={pageNumber <= 3 ? 'eager' : 'lazy'}
                                    onLoad={() => handleImageLoad(pageNumber)}
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 悬浮导航菜单 */}
            <div className="fixed right-3 top-1/2 transform -translate-y-1/2 z-50">
                <div className="flex flex-col gap-3">
                    {menuItems.map((item) => {
                        const getColorClasses = (color: string) => {
                            switch (color) {
                                case 'default':
                                    return 'bg-default-100/80 hover:bg-default-200/80 text-default-700 border-default-200/50';
                                case 'primary':
                                    return 'bg-primary-50/80 hover:bg-primary-100/80 text-primary-600 border-primary-200/50';
                                case 'secondary':
                                    return 'bg-secondary-50/80 hover:bg-secondary-100/80 text-secondary-600 border-secondary-200/50';
                                case 'success':
                                    return 'bg-success-50/80 hover:bg-success-100/80 text-success-600 border-success-200/50';
                                default:
                                    return 'bg-default-100/80 hover:bg-default-200/80 text-default-700 border-default-200/50';
                            }
                        };

                        return (
                            <button
                                key={item.page}
                                onClick={() => scrollToPage(item.page)}
                                className={`
                  ${getColorClasses(item.color)}
                  w-12 h-12 rounded-lg shadow-small
                  flex flex-col items-center justify-center
                  font-medium text-tiny
                  hover:scale-105 active:scale-95 
                  transition-all duration-200
                  backdrop-blur-md border
                `}
                            >
                                <item.icon size={16} className="mb-1" />
                                <span className="text-[9px] leading-tight">{item.textLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
