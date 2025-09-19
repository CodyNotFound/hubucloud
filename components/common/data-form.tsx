'use client';

import { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Chip,
    Switch,
} from '@heroui/react';
import { Plus } from 'lucide-react';

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'multiselect' | 'tags' | 'switch';
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    multiline?: boolean;
    rows?: number;
    min?: number;
    max?: number;
    step?: number;
    validation?: {
        pattern?: RegExp;
        message?: string;
    };
}

export interface DataFormProps {
    title: string;
    fields: FormField[];
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => Promise<void> | void;
    initialData?: Record<string, any>;
    isEdit?: boolean;
    loading?: boolean;
    submitText?: string;
    cancelText?: string;
}

/**
 * 通用数据表单组件
 * 符合DRY原则，支持各种字段类型和验证
 */
export const DataForm = ({
    title,
    fields,
    isOpen,
    onClose,
    onSubmit,
    initialData = {},
    isEdit = false,
    loading = false,
    submitText,
    cancelText = '取消',
}: DataFormProps) => {
    // 确保initialData始终是一个对象
    const safeInitialData = initialData || {};
    const [formData, setFormData] = useState<Record<string, any>>(safeInitialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 当initialData变化时更新formData
    useEffect(() => {
        setFormData(safeInitialData);
        setErrors({});
    }, [initialData]);

    // 重置表单数据
    const resetForm = () => {
        setFormData(safeInitialData);
        setErrors({});
    };

    // 处理字段值变化
    const handleFieldChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        // 清除该字段的错误信息
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        fields.forEach((field) => {
            const value = formData[field.key];

            // 必填验证
            if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
                newErrors[field.key] = `${field.label}为必填项`;
                return;
            }

            // 自定义验证
            if (
                value &&
                field.validation?.pattern &&
                !field.validation.pattern.test(String(value))
            ) {
                newErrors[field.key] = field.validation.message || `${field.label}格式不正确`;
                return;
            }

            // 数字范围验证
            if (field.type === 'number' && value !== undefined && value !== '') {
                const numValue = Number(value);
                if (field.min !== undefined && numValue < field.min) {
                    newErrors[field.key] = `${field.label}不能小于${field.min}`;
                    return;
                }
                if (field.max !== undefined && numValue > field.max) {
                    newErrors[field.key] = `${field.label}不能大于${field.max}`;
                    return;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 处理提交
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            onClose();
            resetForm();
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    // 渲染标签字段
    const renderTagsField = (field: FormField) => {
        const tags: string[] = formData[field.key] || [];
        const [newTag, setNewTag] = useState('');

        const addTag = () => {
            if (newTag.trim() && !tags.includes(newTag.trim())) {
                handleFieldChange(field.key, [...tags, newTag.trim()]);
                setNewTag('');
            }
        };

        const removeTag = (tagToRemove: string) => {
            handleFieldChange(
                field.key,
                tags.filter((tag) => tag !== tagToRemove)
            );
        };

        return (
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input
                        size="sm"
                        placeholder={field.placeholder || '输入标签'}
                        value={newTag}
                        onValueChange={setNewTag}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />
                    <Button size="sm" isIconOnly onClick={addTag}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                            <Chip key={tag} size="sm" onClose={() => removeTag(tag)} variant="flat">
                                {tag}
                            </Chip>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // 渲染字段
    const renderField = (field: FormField) => {
        const value = formData[field.key];
        const hasError = !!errors[field.key];

        const commonProps = {
            label: field.label,
            placeholder: field.placeholder,
            isRequired: field.required,
            errorMessage: errors[field.key],
            isInvalid: hasError,
        };

        switch (field.type) {
            case 'text':
            case 'email':
                return (
                    <Input
                        {...commonProps}
                        type={field.type}
                        value={value || ''}
                        onValueChange={(val) => handleFieldChange(field.key, val)}
                    />
                );

            case 'number':
                return (
                    <Input
                        {...commonProps}
                        type="number"
                        value={value || ''}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onValueChange={(val) =>
                            handleFieldChange(field.key, val ? Number(val) : '')
                        }
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        {...commonProps}
                        value={value || ''}
                        minRows={field.rows || 3}
                        onValueChange={(val) => handleFieldChange(field.key, val)}
                    />
                );

            case 'select':
                return (
                    <Select
                        {...commonProps}
                        selectedKeys={value ? [value] : []}
                        onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0] as string;
                            handleFieldChange(field.key, selectedValue);
                        }}
                    >
                        {(field.options || []).map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                        ))}
                    </Select>
                );

            case 'multiselect':
                return (
                    <Select
                        {...commonProps}
                        selectionMode="multiple"
                        selectedKeys={value || []}
                        onSelectionChange={(keys) => {
                            handleFieldChange(field.key, Array.from(keys));
                        }}
                    >
                        {(field.options || []).map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                        ))}
                    </Select>
                );

            case 'tags':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {field.label}
                            {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        {renderTagsField(field)}
                        {hasError && (
                            <p className="text-tiny text-danger mt-1">{errors[field.key]}</p>
                        )}
                    </div>
                );

            case 'switch':
                return (
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        <Switch
                            isSelected={value || false}
                            onValueChange={(checked) => handleFieldChange(field.key, checked)}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                resetForm();
            }}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                {fields.map((field) => (
                                    <div key={field.key}>{renderField(field)}</div>
                                ))}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                {cancelText}
                            </Button>
                            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
                                {submitText || (isEdit ? '更新' : '创建')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
