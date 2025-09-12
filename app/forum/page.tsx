'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { groupList } from '@/config/forum';

export default function ForumPage() {
    const handleGroupClick = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-sm mx-auto space-y-4">
                {/* 页面标题 */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        湖大萧云论坛
                    </h1>
                    <p className="text-small text-default-500">
                        加入我们的 QQ 群，与同学们交流互动
                    </p>
                </div>

                {/* QQ群列表 */}
                <div className="space-y-3">
                    {groupList.map((group, index) => (
                        <Card
                            key={index}
                            isPressable
                            onPress={() => handleGroupClick(group.url)}
                            className="w-full hover:scale-105 transition-transform cursor-pointer"
                        >
                            <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            {(() => {
                                                const IconComponent = (LucideIcons as any)[
                                                    group.icon
                                                ];
                                                return IconComponent ? (
                                                    <IconComponent className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <MessageSquare className="w-5 h-5 text-primary" />
                                                );
                                            })()}
                                        </div>
                                        <div className="flex-1 flex items-center justify-center">
                                            <h3 className="font-medium text-foreground text-center w-full mr-6">
                                                {group.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-default-400" />
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* 底部提示 */}
                <Card className="mt-6">
                    <CardHeader className="pb-2">
                        <h4 className="text-medium font-semibold">使用提示</h4>
                    </CardHeader>
                    <CardBody className="pt-0">
                        <ul className="text-small text-default-500 space-y-1">
                            <li>• 点击群卡片即可跳转到QQ群</li>
                            <li>• 请遵守群规，文明交流</li>
                            <li>• 如有问题，请联系群管理员</li>
                        </ul>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
