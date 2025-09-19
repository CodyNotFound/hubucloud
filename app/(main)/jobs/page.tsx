'use client';

import type { Parttime } from '@/types';

import { Card, CardBody } from '@heroui/react';
import { MapPin, Clock, DollarSign, Calendar, Phone, Users } from 'lucide-react';

import { usePaginatedData } from '@/hooks/usePaginatedData';
import { parttimeAPI } from '@/services/api';
import { PageLayout, PaginationWrapper, DataStats } from '@/components/common';

export default function JobsPage() {
    const {
        data: parttimes,
        loading,
        total,
        currentPage,
        totalPages,
        filters: _filters,
        updateFilters: _updateFilters,
        goToPage,
        isEmpty,
    } = usePaginatedData<Parttime>({
        fetchFn: parttimeAPI.getList,
        dataKey: 'parttimes',
        initialFilters: {},
        itemsPerPage: 10,
    });

    return (
        <PageLayout
            title="校园兼职"
            description="找到适合你的兼职工作"
            loading={loading}
            isEmpty={isEmpty}
            emptyContent={<div className="text-center py-8 text-default-500">暂无兼职数据</div>}
            filters={null}
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
                <Card key={parttime.id} className="w-full hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                        {/* 职位标题和类型 */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                                    {parttime.name}
                                </h3>
                            </div>
                        </div>

                        {/* 薪资信息 */}
                        <div className="flex items-center gap-1 mb-3">
                            <DollarSign className="w-4 h-4 text-success" />
                            <span className="text-success font-semibold">{parttime.salary}</span>
                        </div>

                        {/* 工作信息 */}
                        <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-default-600">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{parttime.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-default-600">
                                <Clock className="w-4 h-4" />
                                <span>{parttime.worktime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-default-600">
                                <Phone className="w-4 h-4" />
                                <span className="line-clamp-1">{parttime.contact}</span>
                            </div>
                            {parttime.requirements && (
                                <div className="flex items-center gap-2 text-sm text-default-600">
                                    <Users className="w-4 h-4" />
                                    <span className="line-clamp-1">{parttime.requirements}</span>
                                </div>
                            )}
                        </div>

                        {/* 职位描述 */}
                        <p className="text-sm text-default-700 mb-3 line-clamp-2">
                            {parttime.description}
                        </p>

                        {/* 底部信息 */}
                        {parttime.createdAt && (
                            <div className="flex items-center justify-between pt-2 border-t border-default-200">
                                <div className="flex items-center gap-1 text-xs text-default-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        发布于 {new Date(parttime.createdAt).toLocaleDateString()}
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
