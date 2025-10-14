export interface NavItem {
    label: string;
    href: string;
    icon?: string;
}

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: '湖大萧云',
    description: 'Make beautiful websites regardless of your design experience.',
    navItems: [
        {
            label: '首页',
            href: '/',
            icon: 'Home',
        },
        {
            label: '论坛',
            href: '/forum',
            icon: 'MessageSquare',
        },
        {
            label: '美食',
            href: '/food',
            icon: 'UtensilsCrossed',
        },
        {
            label: '兼职',
            href: '/jobs',
            icon: 'Briefcase',
        },
        // {
        //     label: '联通',
        //     href: '/unicom',
        //     icon: 'Briefcase',
        // },
        {
            label: '黑卡',
            href: '/card',
            icon: 'Package',
        },
        {
            label: '驾校',
            href: '/drivingschool',
            icon: 'Car',
        },
    ],
    navMenuItems: [
        {
            label: '首页',
            href: '/',
        },
        {
            label: '论坛',
            href: '/forum',
        },
        {
            label: '美食',
            href: '/food',
        },
        {
            label: '兼职',
            href: '/jobs',
        },
        // {
        //     label: '联通',
        //     href: '/unicom',
        // },
        {
            label: '黑卡',
            href: '/card',
        },
        {
            label: '驾校',
            href: '/drivingschool',
        },
        {
            label: '登录',
            href: '/auth',
        },
    ],
    links: {
        github: 'https://github.com/heroui-inc/heroui',
        twitter: 'https://twitter.com/hero_ui',
        docs: 'https://heroui.com',
        discord: 'https://discord.gg/9b6yyZKmH4',
        sponsor: 'https://patreon.com/jrgarciadev',
    },
};
