'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Spacer } from '@heroui/react';
import {
    Users,
    Store,
    Briefcase,
    BarChart3,
    ArrowRight,
    RefreshCw,
    Activity,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';
import { adminService } from '@/services/admin';

interface DashboardStats {
    totalUsers: number;
    totalRestaurants: number;
    totalParttime: number;
    totalAdmins: number;
    regularUsers: number;
}

interface QuickAction {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export default function AdminDashboard() {
    return (
        <AdminGuard>
            <AdminDashboardWithLayout />
        </AdminGuard>
    );
}

function AdminDashboardWithLayout() {
    const { user, adminStats, logout } = useAdmin();

    return (
        <AdminLayout user={user || undefined} adminStats={adminStats} onLogout={logout}>
            <DashboardContent />
        </AdminLayout>
    );
}

function DashboardContent() {
    const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getAdminStats = async () => {
        try {
            const response = await adminService.getAdminStats();
            if (response.status === 'success' && response.data) {
                setAdminStats(response.data.stats);
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
        }
    };

    useEffect(() => {
        if (!adminStats) {
            getAdminStats();
        }
    }, [adminStats]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await getAdminStats();
        setIsRefreshing(false);
    };

    const quickActions: QuickAction[] = [
        {
            title: '餐厅管理',
            description: '管理餐厅信息',
            icon: <Store className="w-5 h-5" />,
            href: '/admin/restaurant',
            color: 'primary',
        },
        {
            title: '兼职管理',
            description: '管理兼职信息',
            icon: <Briefcase className="w-5 h-5" />,
            href: '/admin/parttime',
            color: 'success',
        },
        {
            title: '活动管理',
            description: '发布和管理校园活动',
            icon: <Calendar className="w-5 h-5" />,
            href: '/admin/activity',
            color: 'secondary',
        },
    ];

    if (!adminStats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-default-600">加载统计数据中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 页面头部 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">管理后台仪表板</h1>
                    <p className="text-default-600 mt-1">欢迎回来！这里是系统概览和快捷操作</p>
                </div>
                <Button
                    isIconOnly
                    variant="light"
                    onPress={handleRefresh}
                    isLoading={isRefreshing}
                    className="text-default-500"
                >
                    <RefreshCw className="w-5 h-5" />
                </Button>
            </div>

            {/* 统计卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">总用户数</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {adminStats.totalUsers}
                                </p>
                                <Chip size="sm" color="primary" variant="flat" className="mt-2">
                                    {adminStats.regularUsers} 普通用户
                                </Chip>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 mb-1">餐厅数量</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {adminStats.totalRestaurants}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <Store className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 mb-1">兼职信息</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {adminStats.totalParttime}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Briefcase className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-none">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 mb-1">管理员数</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {adminStats.totalAdmins}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 快捷操作 */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">快捷操作</h3>
                    </div>
                    <p className="text-default-600 text-sm">常用的管理操作</p>
                </CardHeader>
                <CardBody className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActions.map((action, index) => (
                            <Button
                                key={index}
                                as={Link}
                                href={action.href}
                                variant="flat"
                                color={action.color}
                                className="h-auto p-4 justify-start"
                                startContent={action.icon}
                                endContent={<ArrowRight className="w-4 h-4 opacity-60" />}
                            >
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">{action.title}</span>
                                    <span className="text-xs opacity-70">{action.description}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <Spacer y={4} />
        </div>
    );
}
