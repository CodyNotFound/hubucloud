'use client';

import { useState } from 'react';
import { Input, Chip, Button } from '@heroui/react';
import { Plus } from 'lucide-react';

interface TagsInputProps {
    label?: string;
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    description?: string;
    suggestedTags?: string[];
}

export function TagsInput({
    label = '标签',
    value = [],
    onChange,
    placeholder = '输入标签后按回车添加',
    description,
    suggestedTags = ['校园', '餐饮', '送餐', '外卖', '服务员', '收银', '兼职', '学生优先'],
}: TagsInputProps) {
    const [inputValue, setInputValue] = useState('');

    // 添加标签
    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !value.includes(trimmedTag)) {
            onChange([...value, trimmedTag]);
        }
        setInputValue('');
    };

    // 移除标签
    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    // 处理输入框回车事件
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    // 添加建议标签
    const addSuggestedTag = (tag: string) => {
        if (!value.includes(tag)) {
            onChange([...value, tag]);
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <Input
                    label={label}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    description={description}
                    endContent={
                        inputValue.trim() && (
                            <Button
                                size="sm"
                                isIconOnly
                                variant="light"
                                onPress={() => addTag(inputValue)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        )
                    }
                />
            </div>

            {/* 当前标签 */}
            {value.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700">当前标签:</label>
                    <div className="flex flex-wrap gap-2">
                        {value.map((tag) => (
                            <Chip
                                key={tag}
                                onClose={() => removeTag(tag)}
                                variant="flat"
                                color="primary"
                                size="sm"
                            >
                                {tag}
                            </Chip>
                        ))}
                    </div>
                </div>
            )}

            {/* 建议标签 */}
            {suggestedTags.length > 0 && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-default-700">建议标签:</label>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTags
                            .filter((tag) => !value.includes(tag))
                            .map((tag) => (
                                <Chip
                                    key={tag}
                                    variant="bordered"
                                    size="sm"
                                    className="cursor-pointer hover:bg-default-100"
                                    onClick={() => addSuggestedTag(tag)}
                                >
                                    {tag}
                                </Chip>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
