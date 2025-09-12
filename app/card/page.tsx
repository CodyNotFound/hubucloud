'use client';

import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@heroui/spinner';
import { Card, CardBody } from '@heroui/card';
import { Utensils, Home, Play } from 'lucide-react';
import dynamic from 'next/dynamic';

// 动态导入 react-pdf 组件以避免 SSR 问题
const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), {
    ssr: false,
});
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), {
    ssr: false,
});

// 动态设置 PDF.js worker
if (typeof window !== 'undefined') {
    import('react-pdf').then((pdfjs) => {
        pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    });
}

// 悬浮菜单项配置 - 低调优雅的配色方案
const menuItems = [
    { icon: Utensils, label: '美食区', page: 2, color: 'default', textLabel: '美食' },
    { icon: Home, label: '生活区', page: 32, color: 'default', textLabel: '生活' },
    { icon: Play, label: '娱乐区', page: 41, color: 'default', textLabel: '娱乐' },
];

export default function CardPage() {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [pdfWidth, setPdfWidth] = useState<number>(400);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    useEffect(() => {
        const updatePdfWidth = () => {
            if (typeof window !== 'undefined') {
                setPdfWidth(Math.min(window.innerWidth, 480));
            }
        };

        updatePdfWidth();
        window.addEventListener('resize', updatePdfWidth);
        return () => window.removeEventListener('resize', updatePdfWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setIsLoading(false);
    }

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

            {/* PDF 展示区域 - 纵向滚动显示所有页面 */}
            <section className="w-full">
                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" />
                    </div>
                )}

                <div className="w-full max-w-full overflow-hidden">
                    <Document
                        file="/萧云黑卡权益一览.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<Spinner size="lg" />}
                        error={
                            <Card>
                                <CardBody>
                                    <p className="text-red-500 text-center">PDF 加载失败</p>
                                </CardBody>
                            </Card>
                        }
                    >
                        {!isLoading &&
                            Array.from(new Array(numPages), (_, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    ref={(el) => {
                                        pageRefs.current[index + 1] = el;
                                    }}
                                    className="mb-4 w-full flex justify-center"
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        width={pdfWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </div>
                            ))}
                    </Document>
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
