import Link from 'next/link';

import { HeroCarousel } from '@/components/hero-carousel';

export default function Home() {
    return (
        <>
            <section className="w-full py-2">
                <HeroCarousel />
            </section>

            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">校园服务</h2>
                    <p className="text-sm text-default-600">为湖大学子提供便捷的校园生活服务</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Link
                        href="/forum"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">💬</div>
                        <h3 className="font-semibold text-sm">论坛</h3>
                        <p className="text-xs text-default-600 mt-1">学术讨论与交流</p>
                    </Link>

                    <Link
                        href="/activity"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">🎉</div>
                        <h3 className="font-semibold text-sm">活动</h3>
                        <p className="text-xs text-default-600 mt-1">校园活动信息</p>
                    </Link>

                    <Link
                        href="/food"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">🍜</div>
                        <h3 className="font-semibold text-sm">美食</h3>
                        <p className="text-xs text-default-600 mt-1">校园周边美食</p>
                    </Link>

                    <Link
                        href="/express"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">📦</div>
                        <h3 className="font-semibold text-sm">快递</h3>
                        <p className="text-xs text-default-600 mt-1">快递代收服务</p>
                    </Link>

                    <Link
                        href="/market"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">🛒</div>
                        <h3 className="font-semibold text-sm">跳蚤市场</h3>
                        <p className="text-xs text-default-600 mt-1">二手物品交易</p>
                    </Link>

                    <Link
                        href="/lost-found"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">🔍</div>
                        <h3 className="font-semibold text-sm">失物招领</h3>
                        <p className="text-xs text-default-600 mt-1">帮助找回丢失物品</p>
                    </Link>

                    <Link
                        href="/jobs"
                        className="bg-default-50 rounded-lg p-3 text-center hover:shadow-lg transition-shadow"
                    >
                        <div className="text-2xl mb-2">💼</div>
                        <h3 className="font-semibold text-sm">兼职</h3>
                        <p className="text-xs text-default-600 mt-1">校园兼职招聘</p>
                    </Link>
                </div>
            </section>
        </>
    );
}
