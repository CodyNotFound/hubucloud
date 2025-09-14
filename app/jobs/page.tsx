'use client';

import { Card, CardBody, Chip } from '@heroui/react';
import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react';

import { usePaginatedData } from '@/hooks/usePaginatedData';
import { parttimeAPI } from '@/services/api';
import type { Parttime } from '@/types';
import {
    PageLayout,
    FilterChips,
    PaginationWrapper,
    DataStats
} from '@/components/common';

// 职位类型选项
const jobTypeOptions = [
    { label: '全部', value: '全部' },
    { label: '服务员', value: '服务员' },
    { label: '家教', value: '家教' },
    { label: '配送员', value: '配送员' },
    { label: '客服', value: '客服' },
    { label: '销售', value: '销售' },
    { label: '助理', value: '助理' },
    { label: '其他', value: '其他' }
];

export default function JobsPage() {
    const {
        data: parttimes,
        loading,
        total,
        currentPage,
        totalPages,
        filters,
        updateFilters,
        goToPage,
        isEmpty
    } = usePaginatedData<Parttime>({
        fetchFn: parttimeAPI.getList,
        dataKey: 'parttimes',
        initialFilters: { type: '全部' },
        itemsPerPage: 10
    });

    const handleTypeChange = (type: string) => {
        if (type === '全部') {
            updateFilters({ type: undefined });
        } else {
            updateFilters({ type });
        }
    };

    return (
        <PageLayout
            title="校园兼职"
            description="找到适合你的兼职工作"
            loading={loading}
            isEmpty={isEmpty}
            emptyContent={<div className="text-center py-8 text-default-500">暂无兼职数据</div>}
            filters={
                <FilterChips
                    options={jobTypeOptions}
                    selectedValue={filters.type || '全部'}
                    onSelectionChange={handleTypeChange}
                />
            }
            stats={
                <DataStats
                    total={total}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemName="个职位"
                />
            }
            pagination={
                <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                />
            }
        >
            {parttimes.map((parttime) => (
                <Card
                    key={parttime.id}
                    className="w-full hover:shadow-md transition-shadow"
                >
                    <CardBody className="p-4">
                        {/* 职位标题和类型 */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                                    {parttime.name}
                                </h3>
                            </div>
                            <Chip size="sm" color="primary" variant="flat">
                                {parttime.type}
                            </Chip>
                        </div>

                        {/* 薪资信息 */}
                        <div className="flex items-center gap-1 mb-3">
                            <DollarSign className="w-4 h-4 text-success" />
                            <span className="text-success font-semibold">
                                {parttime.salary}
                            </span>
                        </div>

                        {/* 工作信息 */}
                        <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-default-600">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">
                                    {parttime.location}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-default-600">
                                <Clock className="w-4 h-4" />
                                <span>{parttime.time}</span>
                            </div>
                        </div>

                        {/* 职位描述 */}
                        <p className="text-sm text-default-700 mb-3 line-clamp-2">
                            {parttime.description}
                        </p>

                        {/* 标签 */}
                        {parttime.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {parttime.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        size="sm"
                                        variant="bordered"
                                        className="text-xs"
                                    >
                                        {tag}
                                    </Chip>
                                ))}
                            </div>
                        )}

                        {/* 底部信息 */}
                        {parttime.createdAt && (
                            <div className="flex items-center justify-between pt-2 border-t border-default-200">
                                <div className="flex items-center gap-1 text-xs text-default-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        发布于{' '}
                                        {new Date(parttime.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            ))}
        </PageLayout>
    );
}
