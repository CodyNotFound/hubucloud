'use client';

import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarMenuItem,
} from '@heroui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { useIsSSR } from '@react-aria/ssr';
import { usePathname } from 'next/navigation';
import {
    Home,
    MessageSquare,
    Calendar,
    UtensilsCrossed,
    Package,
    ShoppingBag,
    Briefcase,
    User,
    Car,
    Gamepad2,
} from 'lucide-react';

import { siteConfig } from '@/config/site';
import { ThemeSwitch } from '@/components/theme-switch';
import { InstallButton } from '@/components/pwa-install-prompt';

// 图标映射
const iconMap = {
    Home,
    MessageSquare,
    Calendar,
    UtensilsCrossed,
    Package,
    ShoppingBag,
    Briefcase,
    User,
    Car,
    Gamepad2,
} as const;

export const Navbar = () => {
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const pathname = usePathname();

    return (
        <HeroUINavbar
            maxWidth="full"
            position="sticky"
            className="border-b border-divider z-50 bg-background/70 backdrop-blur-md"
        >
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-2" href="/">
                        <Image
                            src={theme === 'dark' && !isSSR ? '/logod.png' : '/logo.png'}
                            alt="湖大萧云"
                            width={32}
                            height={32}
                            className="rounded-md"
                            priority
                        />
                        <p className="font-bold text-inherit text-lg">湖大萧云</p>
                    </NextLink>
                </NavbarBrand>
            </NavbarContent>

            {/* 桌面端导航菜单 */}
            <NavbarContent className="hidden lg:flex gap-6" justify="center">
                {siteConfig.navItems.slice(0, 7).map((item, index) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    const isActive = pathname === item.href;

                    return (
                        <NextLink
                            key={`${item.label}-${index}`}
                            className={clsx(
                                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-default-600 hover:bg-default-100 hover:text-default-900'
                            )}
                            href={item.href}
                        >
                            {IconComponent && (
                                <IconComponent
                                    size={18}
                                    className={isActive ? 'text-primary' : 'text-default-500'}
                                />
                            )}
                            <span className="text-sm font-medium">{item.label}</span>
                        </NextLink>
                    );
                })}
            </NavbarContent>

            <NavbarContent className="basis-1 pl-4 gap-2" justify="end">
                <InstallButton />
                <ThemeSwitch />
                <NavbarMenuToggle className="lg:hidden" />
            </NavbarContent>

            {/* 移动端侧边栏菜单 */}
            <NavbarMenu className="pt-6">
                <div className="mx-4 mt-2 flex flex-col gap-1">
                    {siteConfig.navItems.map((item, index) => {
                        const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                        const isActive = pathname === item.href;

                        return (
                            <NavbarMenuItem key={`${item.label}-${index}`}>
                                <NextLink
                                    className={clsx(
                                        'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-default-600 hover:bg-default-100 hover:text-default-900'
                                    )}
                                    href={item.href}
                                >
                                    {IconComponent && (
                                        <IconComponent
                                            size={20}
                                            className={
                                                isActive ? 'text-primary' : 'text-default-500'
                                            }
                                        />
                                    )}
                                    <span className="text-medium">{item.label}</span>
                                </NextLink>
                            </NavbarMenuItem>
                        );
                    })}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    );
};
