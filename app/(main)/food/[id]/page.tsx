'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Chip, Button, Divider } from '@heroui/react';
import { ArrowLeft, MapPin, Star, Clock, Phone, Heart } from 'lucide-react';

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

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
};

export default function RestaurantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const restaurantId = params?.id as string;

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
                    <Button color="primary" variant="light" onPress={() => router.back()}>
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
                    <Button isIconOnly variant="light" size="sm" onPress={() => router.back()}>
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
                    !restaurant.locationDescription.includes('不知道')) ? (
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
                                        color="primary"
                                        className={
                                            restaurant.phone && restaurant.phone.trim() !== ''
                                                ? 'flex-1'
                                                : 'w-full'
                                        }
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
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}
