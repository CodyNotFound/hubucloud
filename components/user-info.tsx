'use client';

import { Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { User as LucideUser, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export const UserInfo = () => {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/auth');
    };

    // 暂时只显示登录按钮，避免 useAuth 的问题
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
};
