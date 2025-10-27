'use client';

import type { ApiResponse, FilterParams } from '@/types';

import { useState, useEffect, useCallback, useRef } from 'react';

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

    // 使用 ref 保存最新的 filters，避免闭包问题
    const filtersRef = useRef<FilterParams>(initialFilters);

    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // 加载数据 - 使用 ref 避免依赖 filters
    const loadData = useCallback(
        async (page: number, currentFilters?: FilterParams) => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const params: FilterParams = {
                    page,
                    limit: itemsPerPage,
                    ...(currentFilters || {}),
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
        [fetchFn, itemsPerPage, dataKey]
    );

    // 更新筛选条件
    const updateFilters = useCallback(
        (newFilters: FilterParams) => {
            setFilters((prev) => {
                const updated = { ...prev, ...newFilters };
                // 筛选条件改变时重置到第一页
                loadData(1, updated);
                return updated;
            });
        },
        [loadData]
    );

    // 重置筛选条件
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
        loadData(1, initialFilters);
    }, [loadData, initialFilters]);

    // 跳转到指定页面 - 使用 ref 避免依赖 filters
    const goToPage = useCallback(
        (page: number) => {
            if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
                loadData(page, filtersRef.current);
            }
        },
        [loadData, state.totalPages, state.currentPage]
    );

    // 刷新数据 - 使用 ref 避免依赖 filters
    const refresh = useCallback(() => {
        loadData(state.currentPage, filtersRef.current);
    }, [loadData, state.currentPage]);

    // 初始加载 - 只在组件挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        loadData(1, initialFilters);
    }, []); // 空依赖数组，只在挂载时执行一次

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
