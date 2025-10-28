'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Chip, Button, Divider } from '@heroui/react';
import { ArrowLeft, MapPin, Star, Clock, Phone, Heart, QrCode, Download } from 'lucide-react';

import { ImageViewer } from '@/components/common/image-viewer';
import { RestaurantType, RestaurantTypeLabels } from '@/types/restaurant';

// 餐厅数据类型
interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    type: RestaurantType;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    locationDescription: string;
    orderQrCode?: string; // 点餐码
    orderLink?: string; // 点餐直链
    menuText?: string; // 菜单文字描述
    menuImages?: string[]; // 菜单图片
}

// API响应类型
interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
}

// API请求函数
const fetchRestaurantDetail = async (id: string): Promise<ApiResponse<Restaurant>> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    const url = `${API_BASE_URL}/restaurants/${id}`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export default function RestaurantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const restaurantId = params?.id as string;

    // 智能返回函数：解决微信/QQ浏览器无历史记录时直接退出的问题
    const handleBack = () => {
        // 检查是否有历史记录（>1 表示有前一个页面）
        if (typeof window !== 'undefined' && window.history.length > 1) {
            // 有历史记录，正常返回
            router.back();
        } else {
            // 无历史记录（直接从外部进入），跳转到列表页
            router.push('/food');
        }
    };

    // 加载餐厅详情
    const loadRestaurantDetail = async () => {
        if (!restaurantId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetchRestaurantDetail(restaurantId);

            if (response.status === 'success' && response.data) {
                setRestaurant(response.data);
            } else {
                setError(response.message || '获取餐厅详情失败');
            }
        } catch (error) {
            console.error('加载餐厅详情失败:', error);
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRestaurantDetail();
    }, [restaurantId]);

    // 保存点餐码图片
    const handleSaveQrCode = async () => {
        if (!restaurant?.orderQrCode) return;

        try {
            // 获取图片
            const response = await fetch(restaurant.orderQrCode);
            const blob = await response.blob();

            // 创建下载链接
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${restaurant.name}-点餐码.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('保存图片失败:', error);
            alert('保存失败，请长按图片手动保存');
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={16}
                className={
                    index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }
            />
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-default-500">加载中...</p>
                </div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-danger mb-4">{error || '餐厅不存在'}</p>
                    <Button color="primary" variant="light" onPress={handleBack}>
                        返回
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* 顶部导航 */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-divider">
                <div className="flex items-center justify-between px-4 py-3">
                    <Button isIconOnly variant="light" size="sm" onPress={handleBack}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="font-semibold truncate mx-4">{restaurant.name}</h1>
                    <Button isIconOnly variant="light" size="sm" color="danger">
                        <Heart size={20} />
                    </Button>
                </div>
            </div>

            {/* 餐厅详情内容 */}
            <div className="pb-20">
                {/* 封面图片 */}
                <div className="relative h-48 bg-default-200">
                    {restaurant.cover ? (
                        <ImageViewer
                            src={restaurant.cover}
                            alt={restaurant.name}
                            thumbnailClassName="w-full h-48"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-default-500">暂无图片</span>
                        </div>
                    )}
                </div>

                {/* 基本信息 */}
                <Card className="mx-4 -mt-6 relative z-5">
                    <CardBody className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-1">{restaurant.name}</h2>
                                <div className="flex items-center gap-2 mb-2">
                                    <Chip size="sm" variant="flat" color="primary">
                                        {RestaurantTypeLabels[restaurant.type] || restaurant.type}
                                    </Chip>
                                    <div className="flex items-center gap-1 text-orange-500">
                                        <span className="text-lg font-bold">
                                            {restaurant.rating}
                                        </span>
                                        <div className="flex">{renderStars(restaurant.rating)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-3" />

                        {/* 营业时间 */}
                        {restaurant.openTime && !restaurant.openTime.includes('营业时间请咨询') && (
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={16} className="text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                    营业时间：{restaurant.openTime}
                                </span>
                            </div>
                        )}

                        {/* 联系信息 */}
                        <div className="space-y-2 mb-3">
                            {/* 位置信息 */}
                            {restaurant.locationDescription &&
                                restaurant.locationDescription.trim() !== '' &&
                                !restaurant.locationDescription.includes('位置不详') &&
                                !restaurant.locationDescription.includes('不知道') && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-default-500" />
                                        <span className="text-sm text-default-700">
                                            {restaurant.locationDescription}
                                        </span>
                                    </div>
                                )}

                            {/* 联系电话 */}
                            {restaurant.phone && restaurant.phone.trim() !== '' && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-default-500" />
                                    <span className="text-sm text-default-700">
                                        {restaurant.phone}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 标签 */}
                        {restaurant.tags.length > 0 && (
                            <div className="mb-3">
                                <h3 className="text-sm font-medium mb-2">餐厅特色</h3>
                                <div className="flex flex-wrap gap-2">
                                    {restaurant.tags.map((tag, index) => (
                                        <Chip key={index} size="sm" variant="flat">
                                            {tag}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Divider className="my-3" />

                        {/* 餐厅描述 */}
                        <div>
                            <h3 className="text-sm font-medium mb-2">餐厅介绍</h3>
                            <p className="text-sm text-default-600 leading-relaxed">
                                {restaurant.description}
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* 点餐码 */}
                {restaurant.orderQrCode && (
                    <Card className="mx-4 mt-4">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <QrCode size={18} className="text-primary" />
                                    <h3 className="text-sm font-medium">扫码点餐</h3>
                                </div>
                                <div className="flex gap-2">
                                    {restaurant.orderLink && (
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onPress={() => {
                                                window.open(restaurant.orderLink, '_blank');
                                            }}
                                        >
                                            点击点餐
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        startContent={<Download size={16} />}
                                        onPress={handleSaveQrCode}
                                    >
                                        保存图片
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-center bg-default-50 rounded-lg p-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={restaurant.orderQrCode}
                                    alt="点餐码"
                                    className="w-full max-w-sm rounded-lg object-contain"
                                    style={{ maxHeight: '70vh' }}
                                    onContextMenu={(e) => {
                                        // 允许长按保存
                                        e.stopPropagation();
                                    }}
                                />
                            </div>
                            <p className="text-xs text-default-500 text-center mt-3">
                                {restaurant.orderLink
                                    ? '点击"点击点餐"按钮直接跳转，或长按图片保存后使用微信/支付宝/美团扫码点餐'
                                    : '长按图片保存或点击"保存图片"按钮，使用微信/支付宝/美团扫码点餐'}
                            </p>
                        </CardBody>
                    </Card>
                )}

                {/* 菜单信息 */}
                {(restaurant.menuText ||
                    (restaurant.menuImages && restaurant.menuImages.length > 0)) && (
                    <Card className="mx-4 mt-4">
                        <CardBody className="p-4">
                            <h3 className="text-sm font-medium mb-3">菜单</h3>

                            {/* 菜单文字描述 */}
                            {restaurant.menuText && restaurant.menuText.trim() !== '' && (
                                <div className="mb-3">
                                    <p className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">
                                        {restaurant.menuText}
                                    </p>
                                </div>
                            )}

                            {/* 菜单图片 */}
                            {restaurant.menuImages && restaurant.menuImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {restaurant.menuImages.map((image, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square bg-default-200 rounded-lg overflow-hidden"
                                        >
                                            <ImageViewer
                                                src={image}
                                                alt={`${restaurant.name} 菜单 ${index + 1}`}
                                                thumbnailClassName="w-full h-full rounded-lg"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* 预览图片 */}
                {restaurant.preview.length > 0 && (
                    <Card className="mx-4 mt-4">
                        <CardBody className="p-4">
                            <h3 className="text-sm font-medium mb-3">餐厅图片</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {restaurant.preview.map((image, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-default-200 rounded-lg overflow-hidden"
                                    >
                                        <ImageViewer
                                            src={image}
                                            alt={`${restaurant.name} 图片 ${index + 1}`}
                                            thumbnailClassName="w-full h-full rounded-lg"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* 底部操作按钮 */}
                {(restaurant.phone && restaurant.phone.trim() !== '') ||
                (restaurant.locationDescription &&
                    restaurant.locationDescription.trim() !== '' &&
                    !restaurant.locationDescription.includes('位置不详') &&
                    !restaurant.locationDescription.includes('不知道')) ||
                restaurant.orderLink ? (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-divider">
                        <div className="flex gap-3">
                            {restaurant.phone && restaurant.phone.trim() !== '' && (
                                <Button
                                    variant="bordered"
                                    className="flex-1"
                                    startContent={<Phone size={16} />}
                                    onPress={() => {
                                        window.location.href = `tel:${restaurant.phone}`;
                                    }}
                                >
                                    拨打电话
                                </Button>
                            )}
                            {restaurant.locationDescription &&
                                restaurant.locationDescription.trim() !== '' &&
                                !restaurant.locationDescription.includes('位置不详') &&
                                !restaurant.locationDescription.includes('不知道') && (
                                    <Button
                                        variant="bordered"
                                        className="flex-1"
                                        startContent={<MapPin size={16} />}
                                        onPress={() => {
                                            // 构建高德地图搜索URL，武汉市城市代码为420100
                                            const query = encodeURIComponent(
                                                `${restaurant.name} ${restaurant.locationDescription}`
                                            );
                                            const amapUrl = `https://ditu.amap.com/search?query=${query}&city=420100`;
                                            window.open(amapUrl, '_blank');
                                        }}
                                    >
                                        查看位置
                                    </Button>
                                )}
                            {restaurant.orderLink && (
                                <Button
                                    color="primary"
                                    className="flex-1"
                                    startContent={<QrCode size={16} />}
                                    onPress={() => {
                                        window.open(restaurant.orderLink, '_blank');
                                    }}
                                >
                                    在线点餐
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}
