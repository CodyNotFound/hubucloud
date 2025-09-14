import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
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
                                <main className="flex-grow overflow-y-auto w-full px-4 py-4">
                                    {children}
                                </main>
                            </div>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
