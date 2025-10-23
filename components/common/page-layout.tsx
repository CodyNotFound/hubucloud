'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface PageLayoutProps {
    /** 页面标题 */
    title: string;
    /** 页面描述 */
    description?: string;
    /** 筛选区内容 */
    filters?: ReactNode;
    /** 主要内容 */
    children: ReactNode;
    /** 分页器 */
    pagination?: ReactNode;
    /** 是否显示加载状态 */
    loading?: boolean;
    /** 加载文本 */
    loadingText?: string;
    /** 空数据时的显示内容 */
    emptyContent?: ReactNode;
    /** 是否显示空数据状态 */
    isEmpty?: boolean;
    /** 统计信息 */
    stats?: ReactNode;
}

export function PageLayout({
    title,
    description,
    filters,
    children,
    pagination,
    loading = false,
    loadingText = '加载中...',
    emptyContent,
    isEmpty = false,
    stats,
}: PageLayoutProps) {
    return (
        <>
            {/* 页面标题区 */}
            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    {description && <p className="text-sm text-default-600">{description}</p>}
                </div>

                {/* 筛选区 */}
                {filters && <div className="mb-4">{filters}</div>}

                {/* 统计信息 */}
                {stats && !loading && <div className="mb-3">{stats}</div>}
            </section>

            {/* 内容区 */}
            <section className="w-full py-2">
                {loading ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-default-500">{loadingText}</p>
                    </div>
                ) : isEmpty ? (
                    emptyContent || (
                        <div className="text-center py-8 text-default-500">暂无数据</div>
                    )
                ) : (
                    <div className="space-y-3">{children}</div>
                )}

                {/* 分页器 */}
                {pagination && !loading && !isEmpty && <div className="mt-6">{pagination}</div>}
            </section>
        </>
    );
}
