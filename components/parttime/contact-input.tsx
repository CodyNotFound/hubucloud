'use client';

import { useState, useEffect } from 'react';
import { Input, Chip, Switch } from '@heroui/react';
import { Phone, MessageCircle } from 'lucide-react';

interface ContactInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    isRequired?: boolean;
    description?: string;
}

export function ContactInput({
    value,
    onChange,
    label = '联系方式',
    placeholder: _placeholder = '输入手机号即可',
    isRequired = false,
    description,
}: ContactInputProps) {
    const [phone, setPhone] = useState('');
    const [isWechatSame, setIsWechatSame] = useState(false);

    // 解析现有值到各个字段
    useEffect(() => {
        if (!value) {
            setPhone('');
            setIsWechatSame(false);
            return;
        }

        // 检测是否包含微信同号
        if (value.includes('微信同号') || value.includes('微信手机同号')) {
            const phoneMatch = value.match(/1[3-9]\d{9}/);
            if (phoneMatch) {
                setPhone(phoneMatch[0]);
                setIsWechatSame(true);
            }
            return;
        }

        // 检测纯手机号
        const phoneOnlyMatch = value.match(/^1[3-9]\d{9}$/);
        if (phoneOnlyMatch) {
            setPhone(phoneOnlyMatch[0]);
            setIsWechatSame(false);
            return;
        }
    }, [value]);

    // 更新最终值
    const updateFinalValue = (newPhone: string, wechatSame: boolean) => {
        if (!newPhone) {
            onChange('');
            return;
        }

        if (wechatSame) {
            onChange(`${newPhone}（微信同号）`);
        } else {
            onChange(newPhone);
        }
    };

    const handlePhoneChange = (newPhone: string) => {
        // 只允许数字，自动格式化为手机号
        const cleanPhone = newPhone.replace(/\D/g, '');
        if (cleanPhone.length <= 11) {
            setPhone(cleanPhone);
            updateFinalValue(cleanPhone, isWechatSame);
        }
    };

    const handleWechatSameChange = (wechatSame: boolean) => {
        setIsWechatSame(wechatSame);
        updateFinalValue(phone, wechatSame);
    };

    return (
        <div className="space-y-4">
            <div className="text-sm font-medium">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </div>

            {/* 手机号输入 */}
            <Input
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                startContent={<Phone className="w-4 h-4 text-default-400" />}
                description={`手机号 ${phone.length} 位`}
            />

            {/* 微信同号选项 */}
            <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-default-600" />
                    <span className="text-sm">微信与手机号相同</span>
                </div>
                <Switch
                    size="sm"
                    isSelected={isWechatSame}
                    onValueChange={handleWechatSameChange}
                />
            </div>

            {/* 预览结果 */}
            {value && (
                <div className="space-y-2">
                    <div className="text-sm text-default-600">最终显示：</div>
                    <Chip
                        size="lg"
                        color="primary"
                        variant="flat"
                        startContent={
                            isWechatSame ? (
                                <MessageCircle className="w-4 h-4" />
                            ) : (
                                <Phone className="w-4 h-4" />
                            )
                        }
                    >
                        {value}
                    </Chip>
                </div>
            )}

            {description && <div className="text-xs text-default-500">{description}</div>}

            {/* 隐藏的表单字段 */}
            <Input
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="hidden"
                isRequired={isRequired}
            />
        </div>
    );
}
