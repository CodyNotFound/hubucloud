import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import clsx from 'clsx';

import { Providers } from './providers';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BrowserBackHandler } from '@/components/browser-back-handler';

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
                <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
                    <BrowserBackHandler />
                    <div className="relative flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow w-full px-4 py-4 pt-0 overflow-y-auto">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
