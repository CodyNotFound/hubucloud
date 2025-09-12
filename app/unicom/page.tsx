'use client';

import { Card, CardBody, CardFooter, CardHeader, Button, Divider, Chip } from '@heroui/react';
import { QRCodeComponent } from '@/components/qr-code';
import {
    Smartphone,
    Wifi,
    Gift,
    Zap,
    Globe,
    Video,
    ShoppingBag,
    MessageCircle,
} from 'lucide-react';

export default function UnicomPage() {
    const handleApply = () => {
        window.open('https://qy.chinaunicom.cn/u/i0saPVX3', '_blank');
    };

    const appCategories = [
        {
            category: '腾讯系应用',
            icon: <MessageCircle className="w-5 h-5" />,
            apps: [
                'QQ',
                '微信',
                '应用宝',
                'QQ浏览器',
                'QQ音乐',
                'QQ阅读',
                'QQ输入法',
                'QQ邮箱',
                '腾讯新闻',
                '腾讯视频',
                '腾讯地图',
                '腾讯微云',
                '腾讯游戏',
                '腾讯微视',
                '微店',
                '全民K歌',
            ],
        },
        {
            category: '阿里系应用',
            icon: <ShoppingBag className="w-5 h-5" />,
            apps: [
                '淘宝',
                '天猫',
                '支付宝',
                '咸鱼',
                '聚划算',
                '一淘',
                '蚂蚁金服',
                '饿了么',
                '口碑网',
                '阿里云',
                '中国雅虎',
                '中国万网',
                '优酷',
                '土豆网',
                '书旗小说',
                '高德地图',
                '飞猪',
                'UC浏览器',
                '菜鸟网络',
                '墨迹天气',
            ],
        },
        {
            category: '头条系应用',
            icon: <Video className="w-5 h-5" />,
            apps: [
                '抖音短视频',
                '火山小视频',
                '西瓜视频',
                '悟空问答',
                '头条号',
                '多闪',
                '懂车帝',
                '皮皮虾',
                'faceu激萌',
                '图虫',
                '快看漫画',
                'TopBuzz',
                'musical.ly',
                'TopBuzz Video',
                'Tiktok',
                'NewsRepublic',
            ],
        },
    ];

    return (
        <>
            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Smartphone className="w-6 h-6 text-primary" />
                        校园卡办理
                    </h2>
                    <p className="text-sm text-default-600">中国联通校园卡专属优惠</p>
                </div>

                <div className="space-y-2">
                    {/* 1. 卡的核心信息 */}
                    <Card className="w-full">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">
                                    中国联通校园卡
                                </h3>
                                <Chip className="ml-2" color="primary" variant="flat" size="sm">
                                    推荐
                                </Chip>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                    <Zap className="w-4 h-4 text-warning" />
                                    <span className="text-sm">月租 39 元</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Globe className="w-4 h-4 text-success" />
                                    <span className="text-sm">无合约</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Wifi className="w-4 h-4 text-primary" />
                                    <span className="text-sm">+7元 校园网</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Gift className="w-4 h-4 text-secondary" />
                                    <span className="text-sm">随时注销</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 2. 详细介绍图片 */}
                    <Card className="w-full">
                        <img
                            src="/unicom.webp"
                            alt="联通校园卡详细介绍"
                            className="w-full rounded-lg"
                        />
                    </Card>

                    {/* 3. 权益领取二维码/按钮 */}
                    <Card className="w-full">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-foreground">权益领取</h3>
                        </CardHeader>
                        <CardBody className="pt-0">
                            <div className="flex flex-col items-center gap-3">
                                <QRCodeComponent
                                    text="https://qy.chinaunicom.cn/u/i0saPVX3"
                                    size={150}
                                    className="border rounded"
                                />
                            </div>
                        </CardBody>
                        <CardFooter>
                            <div>
                                <Button
                                    color="primary"
                                    className="w-full font-medium"
                                    startContent={<Gift className="w-4 h-4" />}
                                    onPress={handleApply}
                                >
                                    免费领取1年视频会员
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-foreground">
                                定向流量应用覆盖
                            </h3>
                            <p className="text-sm text-default-500 ml-2">以下应用可使用定向流量</p>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            {appCategories.map((category, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        {category.icon}
                                        <h4 className="font-medium text-foreground">
                                            {category.category}
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {category.apps.map((app, appIndex) => (
                                            <Chip
                                                key={appIndex}
                                                variant="flat"
                                                size="sm"
                                                color={
                                                    index === 0
                                                        ? 'primary'
                                                        : index === 1
                                                          ? 'warning'
                                                          : 'secondary'
                                                }
                                            >
                                                {app}
                                            </Chip>
                                        ))}
                                    </div>
                                    {index < appCategories.length - 1 && <Divider />}
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </div>
            </section>
        </>
    );
}
