import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full border-t border-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 py-3">
                <div className="flex flex-col items-center justify-center space-y-2 text-xs text-default-500">
                    {/* 版权信息 */}
                    <div className="text-center">© 2025 湖大萧云 版权所有</div>

                    {/* ICP备案信息 */}
                    <div className="flex items-center space-x-1">
                        <Link
                            href="https://beian.miit.gov.cn/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                        >
                            鄂ICP备2025139492号
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
