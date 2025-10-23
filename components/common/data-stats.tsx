'use client';

interface DataStatsProps {
    /** 总数量 */
    total: number;
    /** 当前页码 */
    currentPage: number;
    /** 总页数 */
    totalPages: number;
    /** 数据类型名称，如 "个职位", "家餐厅" */
    itemName?: string;
    /** 是否显示页码信息 */
    showPageInfo?: boolean;
    /** 自定义样式 */
    className?: string;
}

export function DataStats({
    total,
    currentPage,
    totalPages,
    itemName = '条记录',
    showPageInfo = true,
    className = '',
}: DataStatsProps) {
    return (
        <div className={`flex items-center justify-between text-sm text-default-600 ${className}`}>
            <span>
                共找到 <span className="font-semibold text-primary">{total}</span> {itemName}
            </span>
            {showPageInfo && totalPages > 1 && (
                <span className="text-xs text-default-500">
                    第 {currentPage} 页，共 {totalPages} 页
                </span>
            )}
        </div>
    );
}
