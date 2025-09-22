'use client';

import { useState } from 'react';
import { Input, Select, SelectItem, Button, Spinner, Tooltip, Pagination } from '@heroui/react';
import { Search, Filter, Edit3, Trash2, ArrowUpDown } from 'lucide-react';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'right' | 'center';
    width?: string;
    render?: (item: any) => React.ReactNode;
}

interface PracticalDataTableProps {
    title: string;
    columns: Column[];
    data: any[];
    loading?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filterOptions?: Array<{ key: string; label: string }>;
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onAdd?: () => void;
    addButtonText?: string;
    emptyMessage?: string;
    // 分页相关
    enablePagination?: boolean;
    total?: number;
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export const PracticalDataTable = ({
    title,
    columns,
    data,
    loading = false,
    searchPlaceholder = '搜索...',
    searchValue = '',
    onSearchChange,
    filterOptions,
    filterValue = 'all',
    onFilterChange,
    onEdit,
    onDelete,
    onAdd,
    addButtonText = '添加',
    emptyMessage = '暂无数据',
    // 分页相关
    enablePagination = false,
    total = 0,
    page = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
}: PracticalDataTableProps) => {
    const [sortField, setSortField] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const renderCell = (item: any, column: Column) => {
        if (column.render) {
            return column.render(item);
        }

        const value = item[column.key];

        // 处理日期
        if (column.key === 'createdAt' && value) {
            return new Date(value).toLocaleDateString('zh-CN');
        }

        return value || '-';
    };

    return (
        <div className="w-full">
            {/* 表格标题和工具栏 */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                    {onAdd && (
                        <Button color="primary" onPress={onAdd} className="font-medium">
                            + {addButtonText}
                        </Button>
                    )}
                </div>

                {/* 搜索和筛选 */}
                <div className="flex gap-4 items-center">
                    {onSearchChange && (
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                startContent={<Search className="w-4 h-4 text-default-400" />}
                                classNames={{
                                    input: 'text-sm',
                                    inputWrapper: 'bg-default-100 border-none h-10',
                                }}
                            />
                        </div>
                    )}

                    {onFilterChange && filterOptions && (
                        <div className="w-48">
                            <Select
                                placeholder="筛选"
                                selectedKeys={
                                    filterValue && filterValue !== 'all' ? [filterValue] : []
                                }
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    onFilterChange(selected || 'all');
                                }}
                                startContent={<Filter className="w-4 h-4 text-default-400" />}
                                classNames={{
                                    trigger: 'bg-default-100 border-none h-10',
                                    value: 'text-sm',
                                }}
                            >
                                {filterOptions.map((option) => (
                                    <SelectItem key={option.key}>{option.label}</SelectItem>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* 数据表格 */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                    <span className="ml-2 text-default-500">加载中...</span>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-12 text-default-500">
                    <div className="text-4xl mb-4">📊</div>
                    <div className="text-lg font-medium mb-2">{emptyMessage}</div>
                    <div className="text-sm">暂时没有找到任何数据</div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-content1 rounded-lg overflow-hidden shadow-sm">
                        <thead>
                            <tr className="bg-default-100 border-b border-default-200">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={`px-4 py-3 text-left text-sm font-semibold text-foreground ${
                                            column.sortable
                                                ? 'cursor-pointer hover:bg-default-200'
                                                : ''
                                        } ${column.align === 'right' ? 'text-right' : ''}
                                        ${column.align === 'center' ? 'text-center' : ''}`}
                                        style={{ width: column.width }}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {column.label}
                                            {column.sortable && (
                                                <ArrowUpDown className="w-3 h-3 text-default-400" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {(onEdit || onDelete) && (
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground w-24">
                                        操作
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr
                                    key={item.id || index}
                                    className={`border-b border-default-200 hover:bg-default-100 transition-colors ${
                                        index % 2 === 0 ? 'bg-content1' : 'bg-default-50'
                                    }`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-4 py-3 text-sm text-foreground ${
                                                column.align === 'right' ? 'text-right' : ''
                                            } ${column.align === 'center' ? 'text-center' : ''}`}
                                        >
                                            {renderCell(item, column)}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {onEdit && (
                                                    <Tooltip content="编辑">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => onEdit(item)}
                                                            className="text-default-500 hover:text-primary min-w-8 h-8"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                                {onDelete && (
                                                    <Tooltip content="删除" color="danger">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => onDelete(item)}
                                                            className="text-default-500 hover:text-danger min-w-8 h-8"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 分页组件 */}
            {enablePagination && !loading && data.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-default-500">
                            共 {total} 条记录，第 {page} 页
                        </span>
                        {onPageSizeChange && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-default-500">每页显示</span>
                                <Select
                                    size="sm"
                                    selectedKeys={[pageSize.toString()]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        onPageSizeChange(parseInt(selected));
                                    }}
                                    className="w-20"
                                    classNames={{
                                        trigger: 'h-8 min-h-8',
                                        value: 'text-sm',
                                    }}
                                >
                                    <SelectItem key="10">10</SelectItem>
                                    <SelectItem key="20">20</SelectItem>
                                    <SelectItem key="50">50</SelectItem>
                                    <SelectItem key="100">100</SelectItem>
                                </Select>
                                <span className="text-sm text-default-500">条</span>
                            </div>
                        )}
                    </div>

                    {onPageChange && total > pageSize && (
                        <Pagination
                            total={Math.ceil(total / pageSize)}
                            page={page}
                            onChange={onPageChange}
                            size="sm"
                            showControls
                            classNames={{
                                wrapper: 'gap-0 overflow-visible',
                                item: 'w-8 h-8 text-small',
                                cursor: 'bg-primary-500 text-white font-bold',
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
