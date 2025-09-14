'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Chip, Input, Pagination } from '@heroui/react';
import { Search, MapPin, Star, Loader2 } from 'lucide-react';

// 餐厅数据类型（对应后端）
interface Restaurant {
    id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    type: string;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    latitude: number;
    longitude: number;
    distance?: number;
}

// API响应类型
interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
}

interface PaginationData<T> {
    restaurants: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// API请求函数
const fetchRestaurants = async (endpoint: string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== '') {
            query.append(key, params[key].toString());
        }
    });

    const url = `http://localhost:8000/api/restaurants${endpoint}?${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
};

const categories = ['全部', '校内餐饮', '校外主食', '校外小食', '校外茶饮'];

export default function FoodPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [currentPage, setCurrentPage] = useState(1);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    // 加载餐厅数据
    const loadRestaurants = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage,
            };

            if (selectedCategory !== '全部') {
                params.type = selectedCategory;
            }

            let response;
            if (searchTerm) {
                response = await fetchRestaurants('/search', {
                    keyword: searchTerm,
                    ...params,
                });
            } else {
                response = await fetchRestaurants('', params);
            }

            if (response.status === 'success' && response.data) {
                setRestaurants(response.data.restaurants || []);
                setTotal(response.data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('加载餐厅数据失败:', error);
            setRestaurants([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // 初始化和筛选条件变化时重新加载数据
    useEffect(() => {
        loadRestaurants();
    }, [currentPage, selectedCategory, searchTerm]);

    // 当筛选条件改变时重置到第一页
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [selectedCategory, searchTerm]);

    const totalPages = Math.ceil(total / itemsPerPage);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={14}
                className={
                    index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }
            />
        ));
    };

    return (
        <>
            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">校园美食</h2>
                    <p className="text-sm text-default-600">发现湖大周边美味</p>
                </div>

                {/* 搜索栏 */}
                <div className="mb-4">
                    <Input
                        placeholder="搜索美食商家或菜品..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startContent={<Search size={20} className="text-default-400" />}
                        className="w-full"
                    />
                </div>

                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            variant={selectedCategory === category ? 'solid' : 'flat'}
                            color={selectedCategory === category ? 'primary' : 'default'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="cursor-pointer"
                        >
                            {category}
                        </Chip>
                    ))}
                </div>

                {/* 商户统计信息 */}
                {!loading && (
                    <div className="flex justify-between items-center mb-3 text-sm text-default-500">
                        <span>找到 {total} 家餐厅</span>
                        <span>
                            第 {currentPage}/{totalPages} 页
                        </span>
                    </div>
                )}

                {/* 餐厅列表 */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-default-500">加载中...</p>
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className="text-center py-8 text-default-500">暂无餐厅数据</div>
                    ) : (
                        restaurants.map((restaurant) => (
                            <Card key={restaurant.id} className="w-full" isPressable>
                                <CardBody className="p-3">
                                    <div className="flex gap-3">
                                        {/* 餐厅图片 */}
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-default-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                {restaurant.cover ? (
                                                    <img
                                                        src={restaurant.cover}
                                                        alt={restaurant.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-default-500">
                                                        图片
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 餐厅信息 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-semibold text-sm truncate">
                                                    {restaurant.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-orange-500">
                                                    <span className="text-sm font-medium">
                                                        {restaurant.rating}
                                                    </span>
                                                    <div className="flex">
                                                        {renderStars(restaurant.rating)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <Chip size="sm" variant="flat" color="primary">
                                                    {restaurant.type}
                                                </Chip>
                                                <span className="text-xs text-green-600 font-medium">
                                                    营业时间：{restaurant.openTime}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-xs text-default-500 mb-2">
                                                <MapPin size={12} className="mr-1" />
                                                <span className="truncate">
                                                    {restaurant.address}
                                                </span>
                                                <span className="ml-2">
                                                    电话：{restaurant.phone}
                                                </span>
                                            </div>

                                            <p className="text-xs text-default-600 line-clamp-2 mb-2">
                                                {restaurant.description}
                                            </p>

                                            {restaurant.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {restaurant.tags
                                                        .slice(0, 3)
                                                        .map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs px-2 py-1 bg-default-100 rounded text-default-600"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>

                {/* 分页组件 */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <Pagination
                            isCompact
                            showControls
                            total={totalPages}
                            page={currentPage}
                            onChange={setCurrentPage}
                            color="primary"
                            size="sm"
                        />
                    </div>
                )}
            </section>
        </>
    );
}
