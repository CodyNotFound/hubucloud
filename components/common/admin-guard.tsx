'use client';

import { ReactNode } from 'react';
import { Card, CardBody } from '@heroui/react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { useAdmin } from '@/hooks/use-admin';

interface AdminGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * 管理员权限保护组件
 * 只有管理员才能看到子组件内容
 */
export const AdminGuard = ({ children, fallback }: AdminGuardProps) => {
    const { isAdmin, isLoading, error } = useAdmin();

    // 加载中
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="flex items-center space-x-2 text-default-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>验证管理员权限中...</span>
                </div>
            </div>
        );
    }

    // 权限验证失败或不是管理员
    if (!isAdmin || error) {
        if (fallback) {
            return <>{fallback}</>;
        }

        // 清除登录信息的处理函数
        const handleClearAndRedirect = () => {
            // 清除所有登录相关信息
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            // 跳转到登录页
            window.location.href = '/auth';
        };

        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md w-full">
                    <CardBody className="text-center space-y-4 p-6">
                        <div className="flex justify-center">
                            <AlertTriangle className="w-12 h-12 text-warning" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">访问受限</h3>
                            <p className="text-default-600 text-sm">
                                {error || '您需要管理员权限才能访问此页面'}
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleClearAndRedirect}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                            >
                                重新登录
                            </button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // 权限验证通过，显示子组件
    return <>{children}</>;
};
