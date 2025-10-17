import '@/styles/globals.css';
import { Metadata, Viewport } from 'next';
import clsx from 'clsx';
import Script from 'next/script';

import { Providers } from './providers';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BrowserBackHandler } from '@/components/browser-back-handler';
import { SWAutoUpdate } from '@/components/sw-auto-update';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: '/favicon.ico',
        apple: '/logod.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: '湖大萧云',
        startupImage: [
            {
                url: '/logod.png',
                media: '(device-width: 375px) and (device-height: 812px)',
            },
        ],
    },
    formatDetection: {
        telephone: false,
    },
    other: {
        'mobile-web-app-capable': 'yes',
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
                <Script
                    defer
                    src="https://umami.hubucloud.com/script.js"
                    data-website-id="8c2107ef-77f6-436d-a9bc-30d4a71e961d"
                    strategy="afterInteractive"
                ></Script>
                <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
                    <BrowserBackHandler />
                    <SWAutoUpdate />
                    <PWAInstallPrompt />
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
