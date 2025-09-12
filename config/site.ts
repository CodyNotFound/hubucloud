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
            label: '活动',
            href: '/activity',
            icon: 'Calendar',
        },
        {
            label: '美食',
            href: '/food',
            icon: 'UtensilsCrossed',
        },
        {
            label: '快递',
            href: '/express',
            icon: 'Package',
        },
        {
            label: '跳蚤市场',
            href: '/market',
            icon: 'ShoppingBag',
        },
        {
            label: '失物招领',
            href: '/lost-found',
            icon: 'Search',
        },
        {
            label: '兼职',
            href: '/jobs',
            icon: 'Briefcase',
        },
        {
            label: '个人中心',
            href: '/profile',
            icon: 'User',
        },
    ],
    navMenuItems: [
        {
            label: 'Profile',
            href: '/profile',
        },
        {
            label: 'Dashboard',
            href: '/dashboard',
        },
        {
            label: 'Projects',
            href: '/projects',
        },
        {
            label: 'Team',
            href: '/team',
        },
        {
            label: 'Calendar',
            href: '/calendar',
        },
        {
            label: 'Settings',
            href: '/settings',
        },
        {
            label: 'Help & Feedback',
            href: '/help-feedback',
        },
        {
            label: 'Logout',
            href: '/logout',
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
