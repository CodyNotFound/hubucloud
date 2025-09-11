"use client";

import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarBrand,
    NavbarMenuItem,
} from '@heroui/navbar';
import NextLink from 'next/link';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import { useIsSSR } from '@react-aria/ssr';

import { siteConfig } from '@/config/site';
import { ThemeSwitch } from '@/components/theme-switch';

export const Navbar = () => {
    const { theme } = useTheme();
    const isSSR = useIsSSR();


    return (
        <HeroUINavbar maxWidth="full" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1" href="/">
                        <img 
                            src={theme === "dark" && !isSSR ? "/logod.png" : "/logo.png"} 
                            alt="湖大萧云" 
                            width={32} 
                            height={32} 
                        />
                        <p className="font-bold text-inherit">湖大萧云</p>
                    </NextLink>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="basis-1 pl-4" justify="end">
                <ThemeSwitch />
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <NextLink
                                className={clsx(
                                    'w-full text-lg py-2',
                                    index === 0 ? 'text-primary' : 'text-foreground'
                                )}
                                href={item.href}
                            >
                                {item.label}
                            </NextLink>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </HeroUINavbar>
    );
};
