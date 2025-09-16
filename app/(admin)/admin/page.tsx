'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Progress, Divider, Spacer } from '@heroui/react';
import {
    Users,
    Store,
    Briefcase,
    BarChart3,
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    RefreshCw,
    Activity,
    Eye,
} from 'lucide-react';
import Link from 'next/link';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';

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

interface ActivityItem {
    id: number;
    type: 'restaurant' | 'parttime' | 'user';
    title: string;
    time: string;
    icon: React.ReactNode;
    color: 'primary' | 'secondary' | 'success' | 'warning';
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
            const userInfo = localStorage.getItem('user_info');
            if (userInfo) {
                setAdminStats({
                    totalUsers: 150,
                    totalRestaurants: 5,
                    totalParttime: 7,
                    totalAdmins: 2,
                    regularUsers: 148,
                });
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
            title: '添加餐厅',
            description: '添加新的餐厅信息',
            icon: <Store className="w-5 h-5" />,
            href: '/admin/restaurant',
            color: 'primary',
        },
        {
            title: '发布兼职',
            description: '发布新的兼职信息',
            icon: <Briefcase className="w-5 h-5" />,
            href: '/admin/parttime',
            color: 'success',
        },
        {
            title: '用户管理',
            description: '管理系统用户',
            icon: <Users className="w-5 h-5" />,
            href: '/admin/users',
            color: 'secondary',
        },
        {
            title: '数据统计',
            description: '查看详细统计数据',
            icon: <BarChart3 className="w-5 h-5" />,
            href: '/admin/stats',
            color: 'warning',
        },
    ];

    const recentActivities: ActivityItem[] = [
        {
            id: 1,
            type: 'restaurant',
            title: '新增餐厅"湖大食堂二楼"',
            time: '2小时前',
            icon: <Store className="w-4 h-4" />,
            color: 'primary',
        },
        {
            id: 2,
            type: 'parttime',
            title: '发布兼职"图书馆助理"',
            time: '5小时前',
            icon: <Briefcase className="w-4 h-4" />,
            color: 'success',
        },
        {
            id: 3,
            type: 'user',
            title: '用户注册数量增长',
            time: '1天前',
            icon: <Users className="w-4 h-4" />,
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
                                <div className="flex items-center mt-2">
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">正在营业</span>
                                </div>
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
                                <div className="flex items-center mt-2">
                                    <CheckCircle className="w-4 h-4 text-purple-500 mr-1" />
                                    <span className="text-sm text-purple-600">可申请</span>
                                </div>
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
                                <div className="flex items-center mt-2">
                                    <Clock className="w-4 h-4 text-orange-500 mr-1" />
                                    <span className="text-sm text-orange-600">在线管理</span>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 快捷操作 */}
                <div className="lg:col-span-2">
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
                                            <span className="text-xs opacity-70">
                                                {action.description}
                                            </span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 系统状态 */}
                <div>
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-success" />
                                <h3 className="text-lg font-semibold text-foreground">系统状态</h3>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-2 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-foreground">
                                        用户活跃度
                                    </span>
                                    <span className="text-sm text-success-600 font-semibold">
                                        85%
                                    </span>
                                </div>
                                <Progress
                                    value={85}
                                    color="success"
                                    size="sm"
                                    className="max-w-full"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-foreground">
                                        数据完整性
                                    </span>
                                    <span className="text-sm text-primary-600 font-semibold">
                                        92%
                                    </span>
                                </div>
                                <Progress
                                    value={92}
                                    color="primary"
                                    size="sm"
                                    className="max-w-full"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-foreground">
                                        系统性能
                                    </span>
                                    <span className="text-sm text-warning-600 font-semibold">
                                        78%
                                    </span>
                                </div>
                                <Progress
                                    value={78}
                                    color="warning"
                                    size="sm"
                                    className="max-w-full"
                                />
                            </div>

                            <Divider />

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-success" />
                                    <span className="text-sm text-foreground">API服务正常</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-success" />
                                    <span className="text-sm text-foreground">数据库连接正常</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-warning" />
                                    <span className="text-sm text-foreground">缓存需要清理</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* 最近活动 */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary" />
                        <h3 className="text-lg font-semibold text-foreground">最近活动</h3>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-${activity.color}/10`}>
                                    {activity.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {activity.title}
                                    </p>
                                    <p className="text-xs text-default-600">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <Spacer y={4} />
        </div>
    );
}
