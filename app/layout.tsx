import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import { Link } from '@heroui/link';
import clsx from 'clsx';

import { Providers } from './providers';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />
            <body
                className={clsx(
                    'min-h-screen text-foreground bg-background font-sans antialiased',
                    fontSans.variable
                )}
            >
                <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
                    <div className="md:flex md:items-center md:justify-center md:min-h-screen md:bg-default-100 md:p-4">
                        <div className="md:max-w-md md:w-full md:bg-background md:rounded-3xl md:overflow-hidden md:shadow-2xl md:border md:border-default-200">
                            <div className="relative flex flex-col h-screen md:h-[calc(100vh-2rem)]">
                                <Navbar />
                                <main className="flex-grow overflow-y-auto">{children}</main>
                                <footer className="w-full flex items-center justify-center py-3 bg-background">
                                    <Link
                                        isExternal
                                        className="flex items-center gap-1 text-current"
                                        href="https://heroui.com?utm_source=next-app-template"
                                        title="heroui.com homepage"
                                    >
                                        <span className="text-default-600">Powered by</span>
                                        <p className="text-primary">HeroUI</p>
                                    </Link>
                                </footer>
                            </div>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
