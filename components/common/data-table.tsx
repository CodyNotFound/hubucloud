'use client';

import { ReactNode, useState } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Select,
    SelectItem,
    Card,
    CardBody,
    Pagination,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from '@heroui/react';
import { Search, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';

export interface TableColumn<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
    width?: string;
}

export interface FilterOption {
    key: string;
    label: string;
    options: { label: string; value: string }[];
}

export interface DataTableProps<T> {
    title: string;
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filters?: FilterOption[];
    selectedFilters?: Record<string, string>;
    onFilterChange?: (key: string, value: string) => void;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
    onCreate?: () => void;
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    createButtonText?: string;
    getItemKey?: (item: T) => string;
    emptyText?: string;
    actions?: boolean;
}

/**
 * 通用数据表格组件
 * 符合DRY原则，支持搜索、筛选、分页、CRUD操作
 */
export function DataTable<T extends Record<string, any>>({
    title,
    columns,
    data,
    loading = false,
    pagination,
    searchPlaceholder = '搜索...',
    searchValue = '',
    onSearchChange,
    filters = [],
    selectedFilters = {},
    onFilterChange,
    onPageChange,
    onRefresh,
    onCreate,
    onView,
    onEdit,
    onDelete,
    createButtonText = '添加',
    getItemKey = (item) => item.id,
    emptyText = '暂无数据',
    actions = true,
}: DataTableProps<T>) {
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const {
        isOpen: isDeleteModalOpen,
        onOpen: openDeleteModal,
        onClose: closeDeleteModal,
    } = useDisclosure();

    const handleDelete = (item: T) => {
        setSelectedItem(item);
        openDeleteModal();
    };

    const confirmDelete = () => {
        if (selectedItem && onDelete) {
            onDelete(selectedItem);
        }
        setSelectedItem(null);
        closeDeleteModal();
    };

    const renderActionButtons = (item: T) => {
        if (!actions) return null;

        return (
            <div className="flex items-center gap-1">
                {onView && (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => onView(item)}
                        aria-label="查看"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                )}
                {onEdit && (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => onEdit(item)}
                        aria-label="编辑"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                )}
                {onDelete && (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => handleDelete(item)}
                        aria-label="删除"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* 标题和操作栏 */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={onRefresh}
                            isLoading={loading}
                            aria-label="刷新"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    )}
                    {onCreate && (
                        <Button
                            color="primary"
                            startContent={<Plus className="w-4 h-4" />}
                            onClick={onCreate}
                        >
                            {createButtonText}
                        </Button>
                    )}
                </div>
            </div>

            {/* 搜索和筛选栏 */}
            <div className="flex items-center gap-3 flex-wrap">
                {onSearchChange && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={onSearchChange}
                        startContent={<Search className="w-4 h-4 text-default-500" />}
                        className="max-w-xs"
                        isClearable
                    />
                )}

                {filters.map((filter) => (
                    <Select
                        key={filter.key}
                        placeholder={filter.label}
                        selectedKeys={
                            selectedFilters[filter.key] ? [selectedFilters[filter.key]] : []
                        }
                        onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            onFilterChange?.(filter.key, value);
                        }}
                        className="max-w-xs"
                        size="sm"
                    >
                        {filter.options.map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                        ))}
                    </Select>
                ))}
            </div>

            {/* 数据表格 */}
            <Card>
                <CardBody className="p-0">
                    <Table
                        isStriped
                        removeWrapper
                        aria-label={title}
                        classNames={{
                            table: 'min-h-[400px]',
                        }}
                    >
                        <TableHeader>
                            {[
                                ...columns.map((column) => (
                                    <TableColumn
                                        key={column.key}
                                        width={column.width as any}
                                        allowsSorting={column.sortable}
                                    >
                                        {column.label}
                                    </TableColumn>
                                )),
                                ...(actions
                                    ? [
                                          <TableColumn key="actions" width={'120px' as any}>
                                              操作
                                          </TableColumn>,
                                      ]
                                    : []),
                            ]}
                        </TableHeader>
                        <TableBody
                            isLoading={loading}
                            emptyContent={emptyText}
                            loadingContent="加载中..."
                        >
                            {data.map((item) => (
                                <TableRow key={getItemKey(item)}>
                                    {[
                                        ...columns.map((column) => (
                                            <TableCell key={column.key}>
                                                {column.render
                                                    ? column.render(item)
                                                    : item[column.key]}
                                            </TableCell>
                                        )),
                                        ...(actions
                                            ? [
                                                  <TableCell key={`actions-${getItemKey(item)}`}>
                                                      {renderActionButtons(item)}
                                                  </TableCell>,
                                              ]
                                            : []),
                                    ]}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* 分页 */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        total={pagination.totalPages}
                        page={pagination.page}
                        onChange={onPageChange}
                        showControls
                        showShadow
                        color="primary"
                    />
                </div>
            )}

            {/* 删除确认对话框 */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
                            <ModalBody>
                                <p>确定要删除这条记录吗？此操作无法撤销。</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    取消
                                </Button>
                                <Button color="danger" onPress={confirmDelete}>
                                    删除
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
