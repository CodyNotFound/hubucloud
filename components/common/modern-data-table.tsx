'use client';

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Chip,
    Tooltip,
    Spinner,
    Card,
    CardBody,
    CardHeader,
    Input,
    Select,
    SelectItem,
} from '@heroui/react';
import { Edit3, Trash2, ArrowUpDown, Search, Filter } from 'lucide-react';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: any) => React.ReactNode;
    width?: string;
}

interface ModernDataTableProps {
    title?: string;
    columns: Column[];
    data: any[];
    loading?: boolean;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    emptyText?: string;
    className?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    filterOptions?: Array<{ key: string; label: string }>;
    filterPlaceholder?: string;
}

export const ModernDataTable = ({
    title,
    columns,
    data,
    loading = false,
    onEdit,
    onDelete,
    emptyText = '暂无数据',
    className = '',
    searchValue,
    onSearchChange,
    searchPlaceholder = '搜索...',
    filterValue,
    onFilterChange,
    filterOptions,
    filterPlaceholder = '选择筛选项',
}: ModernDataTableProps) => {
    const renderCell = (item: any, column: Column) => {
        if (column.render) {
            return column.render(item);
        }

        const value = item[column.key];

        // 处理特殊字段
        if (column.key === 'createdAt' && value) {
            return new Date(value).toLocaleDateString('zh-CN');
        }

        if (column.key === 'type' && value) {
            const getTypeColor = (type: string) => {
                const colors: Record<
                    string,
                    'primary' | 'secondary' | 'success' | 'warning' | 'danger'
                > = {
                    配送服务: 'primary',
                    客服: 'secondary',
                    服务员: 'success',
                    助理: 'warning',
                    配送员: 'primary',
                    教育培训: 'danger',
                    服务业: 'success',
                };
                return colors[type] || 'default';
            };

            return (
                <Chip color={getTypeColor(value)} size="sm" variant="flat" className="capitalize">
                    {value}
                </Chip>
            );
        }

        return value;
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardBody className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                    <p className="text-default-500 mt-4">加载中...</p>
                </CardBody>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className={className}>
                <CardBody className="text-center py-12">
                    <Search className="w-16 h-16 text-default-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-default-500 mb-2">{emptyText}</h3>
                    <p className="text-default-400">没有找到任何数据</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-col gap-4">
                {/* 标题和搜索/筛选区域 */}
                <div className="flex flex-col gap-4">
                    {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}

                    {/* 搜索和筛选 */}
                    {(onSearchChange || (onFilterChange && filterOptions)) && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            {onSearchChange && (
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={searchValue || ''}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    startContent={<Search className="w-4 h-4 text-default-400" />}
                                    className="flex-1"
                                    classNames={{
                                        input: 'bg-transparent',
                                        inputWrapper: 'bg-default-100',
                                    }}
                                />
                            )}

                            {onFilterChange && filterOptions && (
                                <Select
                                    placeholder={filterPlaceholder}
                                    selectedKeys={
                                        filterValue && filterValue !== 'all' ? [filterValue] : []
                                    }
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        onFilterChange(selected || 'all');
                                    }}
                                    startContent={<Filter className="w-4 h-4 text-default-400" />}
                                    className="w-full sm:w-48"
                                    classNames={{
                                        trigger: 'bg-default-100',
                                    }}
                                >
                                    {filterOptions.map((option) => (
                                        <SelectItem key={option.key}>{option.label}</SelectItem>
                                    ))}
                                </Select>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardBody className="pt-0 overflow-x-auto">
                <Table
                    aria-label={title || '数据表格'}
                    classNames={{
                        wrapper: 'min-h-[200px]',
                        th: 'bg-default-50 text-default-700 font-semibold',
                        td: 'py-4',
                    }}
                >
                    <TableHeader>
                        {[
                            ...columns.map((column) => (
                                <TableColumn
                                    key={column.key}
                                    width={column.width as any}
                                    className={
                                        column.sortable ? 'cursor-pointer hover:bg-default-100' : ''
                                    }
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable && (
                                            <ArrowUpDown className="w-4 h-4 text-default-400" />
                                        )}
                                    </div>
                                </TableColumn>
                            )),
                            ...(onEdit || onDelete
                                ? [
                                      <TableColumn key="actions" width={'100px' as any}>
                                          <span className="text-center">操作</span>
                                      </TableColumn>,
                                  ]
                                : []),
                        ]}
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow
                                key={item.id || index}
                                className="hover:bg-default-50 transition-colors"
                            >
                                {[
                                    ...columns.map((column) => (
                                        <TableCell key={column.key}>
                                            {renderCell(item, column)}
                                        </TableCell>
                                    )),
                                    ...(onEdit || onDelete
                                        ? [
                                              <TableCell key={`actions-${item.id || index}`}>
                                                  <div className="flex items-center gap-1 justify-center">
                                                      {onEdit && (
                                                          <Tooltip content="编辑">
                                                              <Button
                                                                  isIconOnly
                                                                  size="sm"
                                                                  variant="light"
                                                                  onPress={() => onEdit(item)}
                                                                  className="text-default-500 hover:text-primary"
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
                                                                  className="text-default-500 hover:text-danger"
                                                              >
                                                                  <Trash2 className="w-4 h-4" />
                                                              </Button>
                                                          </Tooltip>
                                                      )}
                                                  </div>
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
    );
};
