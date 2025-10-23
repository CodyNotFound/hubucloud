'use client';

import { useState, useEffect } from 'react';
import { Input, Button, ButtonGroup, Textarea, Chip } from '@heroui/react';
import { Users, User, UserCheck } from 'lucide-react';

interface RequirementsInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    description?: string;
}

type GenderRequirement = 'no-limit' | 'male' | 'female';

export function RequirementsInput({
    value,
    onChange,
    label = '招聘要求',
    placeholder = '请输入其他招聘要求（可选）',
    description,
}: RequirementsInputProps) {
    const [genderRequirement, setGenderRequirement] = useState<GenderRequirement>('no-limit');
    const [otherRequirements, setOtherRequirements] = useState('');

    // 性别要求选项
    const genderOptions = [
        {
            id: 'no-limit' as const,
            label: '男女不限',
            icon: <Users className="w-4 h-4" />,
            color: 'default' as const,
            keyword: '',
        },
        {
            id: 'male' as const,
            label: '限男生',
            icon: <User className="w-4 h-4" />,
            color: 'primary' as const,
            keyword: '限男生',
        },
        {
            id: 'female' as const,
            label: '限女生',
            icon: <UserCheck className="w-4 h-4" />,
            color: 'secondary' as const,
            keyword: '限女生',
        },
    ];

    // 解析现有值
    useEffect(() => {
        if (!value) {
            setGenderRequirement('no-limit');
            setOtherRequirements('');
            return;
        }

        // 检查性别限制关键词
        if (value.includes('限男生')) {
            setGenderRequirement('male');
            setOtherRequirements(value.replace(/限男生[，。；、]*/g, '').trim());
        } else if (value.includes('限女生')) {
            setGenderRequirement('female');
            setOtherRequirements(value.replace(/限女生[，。；、]*/g, '').trim());
        } else {
            setGenderRequirement('no-limit');
            setOtherRequirements(value);
        }
    }, [value]);

    // 更新最终值
    const updateValue = (gender: GenderRequirement, other: string) => {
        const genderText =
            gender === 'no-limit'
                ? ''
                : genderOptions.find((opt) => opt.id === gender)?.keyword || '';

        const parts = [genderText, other].filter(Boolean);
        const finalValue = parts.join('，');

        onChange(finalValue);
    };

    const handleGenderChange = (newGender: GenderRequirement) => {
        setGenderRequirement(newGender);
        updateValue(newGender, otherRequirements);
    };

    const handleOtherRequirementsChange = (newOther: string) => {
        setOtherRequirements(newOther);
        updateValue(genderRequirement, newOther);
    };

    // 常用要求模板
    const requirementTemplates = [
        '有相关经验优先',
        '责任心强',
        '沟通能力强',
        '工作时间稳定',
        '能吃苦耐劳',
        '形象气质佳',
        '普通话标准',
        '学习能力强',
    ];

    const addRequirementTemplate = (template: string) => {
        const current = otherRequirements;
        const newValue = current ? `${current}，${template}` : template;
        handleOtherRequirementsChange(newValue);
    };

    return (
        <div className="space-y-4">
            {/* 性别要求选择 */}
            <div className="space-y-2">
                <div className="text-sm font-medium">性别要求</div>
                <ButtonGroup className="w-full">
                    {genderOptions.map((option) => (
                        <Button
                            key={option.id}
                            variant={genderRequirement === option.id ? 'solid' : 'bordered'}
                            color={genderRequirement === option.id ? option.color : 'default'}
                            startContent={option.icon}
                            onPress={() => handleGenderChange(option.id)}
                            className="flex-1"
                        >
                            {option.label}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>

            {/* 其他要求输入 */}
            <div className="space-y-2">
                <Textarea
                    label="其他要求"
                    placeholder={placeholder}
                    value={otherRequirements}
                    onChange={(e) => handleOtherRequirementsChange(e.target.value)}
                    rows={3}
                    description={description}
                />

                {/* 常用要求模板 */}
                <div className="space-y-2">
                    <div className="text-sm text-default-600">常用要求（点击添加）：</div>
                    <div className="flex flex-wrap gap-2">
                        {requirementTemplates.map((template) => (
                            <Chip
                                key={template}
                                size="sm"
                                variant="bordered"
                                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                                onClick={() => addRequirementTemplate(template)}
                            >
                                {template}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>

            {/* 最终预览 */}
            {value && (
                <div className="space-y-2">
                    <div className="text-sm text-default-600">最终显示：</div>
                    <div className="p-3 bg-default-100 rounded-lg">
                        <div className="flex items-center gap-2">
                            {genderRequirement !== 'no-limit' && (
                                <Chip
                                    size="sm"
                                    color={
                                        genderOptions.find((opt) => opt.id === genderRequirement)
                                            ?.color
                                    }
                                    startContent={
                                        genderOptions.find((opt) => opt.id === genderRequirement)
                                            ?.icon
                                    }
                                >
                                    {
                                        genderOptions.find((opt) => opt.id === genderRequirement)
                                            ?.label
                                    }
                                </Chip>
                            )}
                            {otherRequirements && (
                                <span className="text-sm text-default-700">
                                    {otherRequirements}
                                </span>
                            )}
                            {!value && <span className="text-sm text-default-500">无特殊要求</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* 隐藏的最终输入字段（用于表单验证） */}
            <Input
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="hidden"
            />
        </div>
    );
}
