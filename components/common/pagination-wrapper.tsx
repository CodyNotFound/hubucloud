'use client';

import { Pagination } from '@heroui/pagination';

interface PaginationWrapperProps {
    /** 当前页码 */
    currentPage: number;
    /** 总页数 */
    totalPages: number;
    /** 页码改变时的回调 */
    onPageChange: (page: number) => void;
    /** 是否显示控制按钮 */
    showControls?: boolean;
    /** 是否紧凑模式 */
    isCompact?: boolean;
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg';
}

export function PaginationWrapper({
    currentPage,
    totalPages,
    onPageChange,
    showControls = true,
    isCompact = true,
    size = 'sm',
}: PaginationWrapperProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center">
            <Pagination
                isCompact={isCompact}
                showControls={showControls}
                total={totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                size={size}
            />
        </div>
    );
}
