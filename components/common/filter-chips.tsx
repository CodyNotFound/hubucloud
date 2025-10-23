'use client';

import { Chip } from '@heroui/chip';

interface FilterOption {
    label: string;
    value: string;
}

interface FilterChipsProps {
    /** 筛选选项 */
    options?: FilterOption[];
    /** 当前选中的值 */
    selectedValue: string;
    /** 选择改变时的回调 */
    onSelectionChange: (value: string) => void;
    /** 自定义样式类名 */
    className?: string;
}

export function FilterChips({
    options = [],
    selectedValue,
    onSelectionChange,
    className = '',
}: FilterChipsProps) {
    // 如果没有选项，不渲染任何内容
    if (!options || options.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option) => (
                <Chip
                    key={option.value}
                    variant={selectedValue === option.value ? 'solid' : 'flat'}
                    color={selectedValue === option.value ? 'primary' : 'default'}
                    size="sm"
                    onClick={() => onSelectionChange(option.value)}
                    className="cursor-pointer"
                >
                    {option.label}
                </Chip>
            ))}
        </div>
    );
}
