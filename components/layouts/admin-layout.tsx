'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Link,
} from '@heroui/react';
import {
    LayoutDashboard,
    Store,
    Briefcase,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    Calendar,
    Package,
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

interface SidebarItem {
    key: string;
    label: string;
    icon: ReactNode;
    href: string;
}

const sidebarItems: SidebarItem[] = [
    {
        key: 'dashboard',
        label: '仪表板',
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: '/admin',
    },
    {
        key: 'restaurant',
        label: '餐厅管理',
        icon: <Store className="w-5 h-5" />,
        href: '/admin/restaurant',
    },
    {
        key: 'content',
        label: '其他内容',
        icon: <Package className="w-5 h-5" />,
        href: '/admin/content',
    },
    {
        key: 'parttime',
        label: '兼职管理',
        icon: <Briefcase className="w-5 h-5" />,
        href: '/admin/parttime',
    },
    {
        key: 'activity',
        label: '活动管理',
        icon: <Calendar className="w-5 h-5" />,
        href: '/admin/activity',
    },
];

interface AdminLayoutWithUserProps extends AdminLayoutProps {
    user?: { username: string };
    adminStats?: any;
    onLogout?: () => void;
}

export default function AdminLayout({
    children,
    user,
    adminStats: _adminStats,
    onLogout,
}: AdminLayoutWithUserProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            router.push('/auth');
        }
    };

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* 顶部导航栏 - 固定高度，不滚动 */}
            <div className="flex-shrink-0 h-16 bg-content1 border-b border-divider">
                <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="lg:hidden"
                        >
                            {sidebarCollapsed ? (
                                <Menu className="w-5 h-5" />
                            ) : (
                                <X className="w-5 h-5" />
                            )}
                        </Button>
                        <Link href="/admin" className="font-bold text-xl text-foreground">
                            湖大云管理后台
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            as={Link}
                            href="/"
                            variant="light"
                            startContent={<Home className="w-4 h-4" />}
                            size="sm"
                            className="text-default-600"
                        >
                            返回前台
                        </Button>

                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button variant="light" className="p-2 h-auto min-w-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            size="sm"
                                            name={user?.username || 'Admin'}
                                            className="bg-primary text-primary-foreground"
                                        />
                                        <span className="hidden md:block text-sm font-medium">
                                            {user?.username || 'Admin'}
                                        </span>
                                    </div>
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="管理员菜单">
                                <DropdownItem
                                    key="profile"
                                    startContent={<Settings className="w-4 h-4" />}
                                >
                                    个人设置
                                </DropdownItem>
                                <DropdownItem
                                    key="logout"
                                    color="danger"
                                    startContent={<LogOut className="w-4 h-4" />}
                                    onPress={handleLogout}
                                >
                                    退出登录
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* 主体内容区域 - 填满剩余空间 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 侧边栏 - 固定宽度，可滚动 */}
                <aside
                    className={`
                        ${sidebarCollapsed ? 'w-16' : 'w-56'}
                        bg-content1 border-r border-divider transition-all duration-300 ease-in-out
                        flex-shrink-0 overflow-y-auto
                        ${sidebarCollapsed ? 'lg:block hidden' : 'block'}
                    `}
                >
                    <nav className="p-3 space-y-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                    ${
                                        isActive(item.href)
                                            ? 'bg-primary text-primary-foreground shadow-small'
                                            : 'text-default-600 hover:bg-default-100 hover:text-foreground'
                                    }
                                    ${sidebarCollapsed ? 'justify-center' : ''}
                                `}
                            >
                                {item.icon}
                                {!sidebarCollapsed && (
                                    <span className="font-medium text-sm">{item.label}</span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* 主内容区域 - 可滚动 */}
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
