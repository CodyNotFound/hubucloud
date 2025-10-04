'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { ArrowLeft } from 'lucide-react';

const externalServices: Record<string, { url: string; title: string }> = {
    jwxt: {
        url: 'https://jwxt.hubu.edu.cn/',
        title: '教务系统',
    },
    one: {
        url: 'https://one.hubu.edu.cn/#/index51',
        title: '智慧琴园',
    },
};

export default function ExternalServicePage() {
    const params = useParams();
    const router = useRouter();
    const service = params.service as string;
    const serviceConfig = externalServices[service];

    if (!serviceConfig) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <p className="text-default-600">服务不存在</p>
                <Button color="primary" onPress={() => router.back()}>
                    返回
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* 顶部导航栏 */}
            <div className="flex items-center gap-3 py-3 border-b border-default-200 bg-background">
                <Button isIconOnly variant="light" onPress={() => router.back()} aria-label="返回">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-lg font-semibold">{serviceConfig.title}</h1>
            </div>

            {/* iframe 内容区 */}
            <div className="flex-1 relative">
                <iframe
                    src={serviceConfig.url}
                    className="absolute inset-0 w-full h-full border-0"
                    title={serviceConfig.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
            </div>
        </div>
    );
}
