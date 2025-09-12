'use client';

import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarMenuItem,
} from '@heroui/navbar';
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
    Search,
    Briefcase,
    User,
} from 'lucide-react';

import { siteConfig } from '@/config/site';
import { ThemeSwitch } from '@/components/theme-switch';

// 图标映射
const iconMap = {
    Home,
    MessageSquare,
    Calendar,
    UtensilsCrossed,
    Package,
    ShoppingBag,
    Search,
    Briefcase,
    User,
} as const;

export const Navbar = () => {
    const { theme } = useTheme();
    const isSSR = useIsSSR();
    const pathname = usePathname();

    return (
        <HeroUINavbar maxWidth="full" position="sticky" className="border-b border-divider">
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

            <NavbarContent className="basis-1 pl-4" justify="end">
                <ThemeSwitch />
                <NavbarMenuToggle className="sm:hidden" />
            </NavbarContent>

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

                {/* 底部分隔线和额外信息 */}
                <div className="mx-4 mt-6 pt-6 border-t border-divider">
                    <div className="flex flex-col gap-2 text-sm text-default-500">
                        <p>湖北大学校园服务平台</p>
                        <p className="text-xs">为湖大学子提供便捷服务</p>
                    </div>
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    );
};
