'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Chip } from '@heroui/react';
import { Lock, Unlock, Clock, Copy, Check } from 'lucide-react';

import type { FoodPasswordResponse } from '@/types';

export default function FoodPasswordPage() {
    const [passwordData, setPasswordData] = useState<FoodPasswordResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // 获取美食口令
    const fetchPassword = async () => {
        try {
            const response = await fetch('/api/food-password');
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                setPasswordData(result.data);
            }
        } catch (error) {
            console.error('获取美食口令失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPassword();

        // 每分钟刷新一次数据
        const interval = setInterval(() => {
            fetchPassword();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // 更新当前时间
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 复制口令到剪贴板
    const handleCopy = async () => {
        if (passwordData?.password) {
            try {
                await navigator.clipboard.writeText(passwordData.password);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('复制失败:', error);
                alert('复制失败，请手动复制');
            }
        }
    };

    // 格式化时间
    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* 页面标题 */}
                <div className="text-center mb-8 pt-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {passwordData?.available ? (
                            <Unlock className="w-10 h-10 text-success" />
                        ) : (
                            <Lock className="w-10 h-10 text-danger" />
                        )}
                        <h1 className="text-3xl md:text-4xl font-bold">美食口令</h1>
                    </div>
                    <p className="text-default-600 text-sm md:text-base">
                        每天 21:50 准时开放，在湖大阳逻交流群参与今日抽奖
                    </p>
                </div>

                {/* 当前时间显示 */}
                <Card className="mb-6">
                    <CardBody className="text-center py-4">
                        <div className="flex items-center justify-center gap-2 text-default-600 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">当前时间</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-mono font-bold">
                            {formatTime(currentTime)}
                        </div>
                    </CardBody>
                </Card>

                {/* 口令卡片 */}
                <Card className="mb-6">
                    <CardBody className="p-6 md:p-8">
                        {passwordData?.available ? (
                            // 口令已开放
                            <div className="space-y-6">
                                <div className="flex items-center justify-center gap-2">
                                    <Chip color="success" variant="flat" size="lg">
                                        口令已开放
                                    </Chip>
                                </div>

                                {passwordData.password ? (
                                    <div>
                                        <p className="text-center text-sm text-default-600 mb-4">
                                            今日美食口令
                                        </p>
                                        <div className="bg-default-100 p-6 rounded-lg text-center">
                                            <div className="text-3xl md:text-4xl font-bold font-mono tracking-wider break-all">
                                                {passwordData.password}
                                            </div>
                                        </div>

                                        {passwordData.description && (
                                            <p className="text-center text-sm text-default-600 mt-4">
                                                {passwordData.description}
                                            </p>
                                        )}

                                        <div className="flex justify-center mt-6">
                                            <Button
                                                color={copied ? 'success' : 'primary'}
                                                variant="flat"
                                                onPress={handleCopy}
                                                startContent={
                                                    copied ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )
                                                }
                                            >
                                                {copied ? '已复制' : '复制口令'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-default-600">
                                            今日口令尚未设置，请稍后再试
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // 口令未开放
                            <div className="space-y-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Chip color="danger" variant="flat" size="lg">
                                        口令未开放
                                    </Chip>
                                </div>

                                <div className="py-8">
                                    <div className="mb-4">
                                        <Lock className="w-20 h-20 mx-auto text-default-300" />
                                    </div>
                                    <p className="text-lg mb-2">{passwordData?.message}</p>
                                    <p className="text-sm text-default-500">开放时间：每天 21:50 - 24:00</p>
                                </div>

                                <div className="bg-default-100 p-4 rounded-lg">
                                    <p className="text-sm text-default-600">
                                        💡 温馨提示：口令将在每天 21:50
                                        准时开放，获取后请前往湖大阳逻交流群参与今日抽奖
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* 使用说明 */}
                <Card>
                    <CardBody className="p-6">
                        <h3 className="font-semibold text-lg mb-4 text-center">使用说明</h3>
                        <div className="space-y-3 text-sm text-default-600">
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                                    1
                                </span>
                                <p>每天 21:50 准时开放美食口令</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                                    2
                                </span>
                                <p>
                                    复制口令后前往
                                    <strong className="text-primary">湖大阳逻交流群</strong>发送口令
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                                    3
                                </span>
                                <p>
                                    在群内使用口令参与
                                    <strong className="text-primary">今日抽奖</strong>活动
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                                    4
                                </span>
                                <p>口令有效期至当天 24:00</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                                    5
                                </span>
                                <p>每天的口令可能不同，请及时关注</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
