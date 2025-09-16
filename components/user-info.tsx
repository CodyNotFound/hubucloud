'use client';

import {
    Avatar,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from '@heroui/react';
import { User as LucideUser, Settings, LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

export const UserInfo = () => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        router.push('/auth');
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('登出失败:', error);
        }
    };

    const handleAdminPanel = () => {
        router.push('/admin');
    };

    // 加载中状态
    if (isLoading) {
        return (
            <Button variant="ghost" size="sm" className="text-sm" isLoading>
                加载中...
            </Button>
        );
    }

    // 未登录状态
    if (!isAuthenticated || !user) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                startContent={<LucideUser size={16} />}
                onPress={handleLogin}
            >
                登录
            </Button>
        );
    }

    // 已登录状态
    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer hover:bg-default-100 transition-colors">
                    <Avatar
                        size="sm"
                        src={user.avatar}
                        name={user.name}
                        fallback={<LucideUser size={16} />}
                        className="w-6 h-6"
                    />
                    <span className="text-sm font-medium">{user.name}</span>
                </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="用户菜单" variant="faded">
                <DropdownItem
                    key="profile"
                    startContent={<LucideUser size={16} />}
                    className="h-14 gap-2"
                >
                    <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-default-500">
                            {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                        </span>
                    </div>
                </DropdownItem>

                {user.role === 'ADMIN' ? (
                    <DropdownItem
                        key="admin"
                        startContent={<Shield size={16} />}
                        onPress={handleAdminPanel}
                        className="text-primary"
                    >
                        管理面板
                    </DropdownItem>
                ) : null}

                <DropdownItem key="settings" startContent={<Settings size={16} />}>
                    设置
                </DropdownItem>

                <DropdownItem
                    key="logout"
                    startContent={<LogOut size={16} />}
                    onPress={handleLogout}
                    className="text-danger"
                    color="danger"
                >
                    退出登录
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};
