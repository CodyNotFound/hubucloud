import '@/styles/globals.css';
import { Metadata } from 'next';
import clsx from 'clsx';

import { Providers } from '../(main)/providers';

import { fontSans } from '@/config/fonts';

export const metadata: Metadata = {
    title: '湖大云管理后台',
    description: '湖大云管理系统后台',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="zh">
            <head />
            <body
                className={clsx(
                    'min-h-screen text-foreground bg-background font-sans antialiased',
                    fontSans.variable
                )}
            >
                <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
