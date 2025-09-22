'use client';

import type { ApiResponse, FilterParams } from '@/types';

import { useState, useEffect, useCallback } from 'react';

interface PaginatedDataOptions<T> {
    /** API获取函数 */
    fetchFn: (
        params: FilterParams
    ) => Promise<ApiResponse<{ items?: T[]; [key: string]: any; pagination?: any }>>;
    /** 每页条目数 */
    itemsPerPage?: number;
    /** 数据字段名，例如 'parttimes' 或 'restaurants' */
    dataKey?: string;
    /** 初始筛选参数 */
    initialFilters?: FilterParams;
    /** 依赖项数组，当这些值变化时重新加载数据 */
    dependencies?: any[];
}

interface PaginatedDataState<T> {
    data: T[];
    loading: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
    error: string | null;
}

export function usePaginatedData<T>({
    fetchFn,
    itemsPerPage = 10,
    dataKey,
    initialFilters = {},
    dependencies = [],
}: PaginatedDataOptions<T>) {
    const [state, setState] = useState<PaginatedDataState<T>>({
        data: [],
        loading: true,
        total: 0,
        currentPage: 1,
        totalPages: 0,
        error: null,
    });

    const [filters, setFilters] = useState<FilterParams>(initialFilters);

    // 加载数据
    const loadData = useCallback(
        async (page: number = state.currentPage, currentFilters: FilterParams = filters) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const params: FilterParams = {
                    page,
                    limit: itemsPerPage,
                    ...currentFilters,
                };

                const response = await fetchFn(params);

                if (response.status === 'success' && response.data) {
                    const responseData = response.data;
                    let items: T[] = [];

                    // 尝试从不同的数据结构中提取数据
                    if (dataKey && responseData[dataKey]) {
                        items = responseData[dataKey];
                    } else if (responseData.list) {
                        items = responseData.list;
                    } else if (responseData.items) {
                        items = responseData.items;
                    } else if (Array.isArray(responseData)) {
                        items = responseData;
                    }

                    const total =
                        (Array.isArray(responseData) ? 0 : responseData.pagination?.total) || 0;
                    const totalPages = Math.ceil(total / itemsPerPage);

                    setState((prev) => ({
                        ...prev,
                        data: items,
                        total,
                        totalPages,
                        currentPage: page,
                        loading: false,
                    }));
                } else {
                    throw new Error(response.error || '获取数据失败');
                }
            } catch (error) {
                console.error('加载数据失败:', error);
                setState((prev) => ({
                    ...prev,
                    data: [],
                    total: 0,
                    totalPages: 0,
                    loading: false,
                    error: error instanceof Error ? error.message : '获取数据失败',
                }));
            }
        },
        [fetchFn, itemsPerPage, dataKey, filters]
    );

    // 更新筛选条件
    const updateFilters = useCallback(
        (newFilters: FilterParams) => {
            setFilters((prev) => ({ ...prev, ...newFilters }));
            // 筛选条件改变时重置到第一页
            loadData(1, { ...filters, ...newFilters });
        },
        [loadData, filters]
    );

    // 重置筛选条件
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
        loadData(1, initialFilters);
    }, [loadData, initialFilters]);

    // 跳转到指定页面
    const goToPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
                loadData(page);
            }
        },
        [loadData, state.totalPages, state.currentPage]
    );

    // 刷新数据
    const refresh = useCallback(() => {
        loadData(state.currentPage, filters);
    }, [loadData, state.currentPage, filters]);

    // 初始加载和依赖项变化时重新加载
    useEffect(() => {
        loadData(1, filters);
    }, [loadData, ...dependencies]);

    // 筛选条件重置页面
    useEffect(() => {
        if (state.currentPage !== 1) {
            setState((prev) => ({ ...prev, currentPage: 1 }));
        }
    }, [filters]);

    return {
        // 状态
        data: state.data,
        loading: state.loading,
        total: state.total,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        error: state.error,
        filters,

        // 分页信息
        pagination: {
            page: state.currentPage,
            limit: itemsPerPage,
            total: state.total,
            totalPages: state.totalPages,
        },

        // 操作方法
        updateFilters,
        resetFilters,
        goToPage,
        refresh,

        // 便捷属性
        isEmpty: !state.loading && state.data.length === 0,
        hasData: state.data.length > 0,
        isLoading: state.loading, // 兼容性别名
    };
}
