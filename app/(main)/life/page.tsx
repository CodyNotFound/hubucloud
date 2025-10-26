'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, Chip, Pagination, Input } from '@heroui/react';
import { MapPin, Star, Loader2, Search } from 'lucide-react';

import { ImageViewer } from '@/components/common/image-viewer';
import { Restaurant, RestaurantSearchItem, RestaurantTypeLabels } from '@/types/restaurant';
import { searchRestaurants, getCachedSearchData, setCachedSearchData } from '@/lib/search-utils';

// API请求函数
const fetchRestaurants = async (endpoint: string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== '') {
            query.append(key, params[key].toString());
        }
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    const url = `${API_BASE_URL}/restaurants${endpoint}?${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
};

function LifePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 从 URL 初始化状态
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
    const [searchData, setSearchData] = useState<RestaurantSearchItem[]>([]);
    const [searchDataLoading, setSearchDataLoading] = useState(true);
    const itemsPerPage = 10;

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 更新 URL 参数的辅助函数
    const updateURL = useCallback(
        (updates: { page?: number; q?: string }) => {
            const params = new URLSearchParams(searchParams.toString());

            if (updates.page !== undefined) {
                if (updates.page === 1) {
                    params.delete('page');
                } else {
                    params.set('page', updates.page.toString());
                }
            }

            if (updates.q !== undefined) {
                if (updates.q === '') {
                    params.delete('q');
                } else {
                    params.set('q', updates.q);
                }
            }

            const newURL = params.toString() ? `?${params.toString()}` : '/life';
            router.replace(newURL, { scroll: false });
        },
        [router, searchParams]
    );

    // 首次加载：获取搜索数据并缓存到本地
    useEffect(() => {
        const loadSearchData = async () => {
            setSearchDataLoading(true);

            // 1. 尝试从缓存读取
            const cached = getCachedSearchData();
            if (cached && cached.length > 0) {
                setSearchData(cached);
                setSearchDataLoading(false);
                return;
            }

            // 2. 缓存不存在，从服务器获取
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
                const url = `${API_BASE_URL}/restaurants/search-data`;

                const response = await fetch(url);
                const result = await response.json();

                if (result.status === 'success' && result.data?.restaurants) {
                    const searchItems = result.data.restaurants as RestaurantSearchItem[];
                    setSearchData(searchItems);
                    setCachedSearchData(searchItems);
                } else {
                    console.error('搜索数据格式错误:', result);
                }
            } catch (error) {
                console.error('加载搜索数据失败:', error);
            } finally {
                setSearchDataLoading(false);
            }
        };

        loadSearchData();
    }, []);

    // 加载生活区数据
    useEffect(() => {
        if (searchDataLoading) {
            return;
        }

        let cancelled = false;

        const loadRestaurants = async () => {
            setLoading(true);
            try {
                const params: any = {
                    page: currentPage,
                    limit: itemsPerPage,
                    type: 'life', // 固定查询生活类型
                };

                let response;

                if (searchKeyword.trim()) {
                    // 本地搜索
                    const matchedIds = searchRestaurants(searchKeyword, searchData);

                    if (matchedIds.length === 0) {
                        if (!cancelled) {
                            setRestaurants([]);
                            setTotal(0);
                            setLoading(false);
                        }
                        return;
                    }

                    // 过滤生活类型
                    const filteredSearchData = searchData.filter(
                        (item) => item.type === 'life' && matchedIds.includes(item.id)
                    );
                    const filteredIds = filteredSearchData.map((item) => item.id);

                    // 分页处理
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedIds = filteredIds.slice(startIndex, endIndex);

                    if (paginatedIds.length > 0) {
                        const idsParam = paginatedIds.join(',');
                        response = await fetchRestaurants('', { ids: idsParam });
                    } else {
                        if (!cancelled) {
                            setRestaurants([]);
                            setTotal(filteredIds.length);
                            setLoading(false);
                        }
                        return;
                    }

                    if (!cancelled) {
                        if (response.status === 'success' && response.data) {
                            const restaurantsMap = new Map(
                                (response.data.restaurants || []).map((r: Restaurant) => [r.id, r])
                            );
                            const orderedRestaurants = paginatedIds
                                .map((id) => restaurantsMap.get(id))
                                .filter(Boolean) as Restaurant[];

                            setRestaurants(orderedRestaurants);
                            setTotal(filteredIds.length);
                        } else {
                            setRestaurants([]);
                            setTotal(0);
                        }
                    }
                } else {
                    // 使用列表API
                    response = await fetchRestaurants('', params);

                    if (!cancelled) {
                        if (response.status === 'success' && response.data) {
                            setRestaurants(response.data.restaurants || []);
                            setTotal(response.data.pagination?.total || 0);
                        } else {
                            setRestaurants([]);
                            setTotal(0);
                        }
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('加载生活区数据失败:', error);
                    setRestaurants([]);
                    setTotal(0);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRestaurants();

        return () => {
            cancelled = true;
        };
    }, [currentPage, searchKeyword, itemsPerPage, searchData, searchDataLoading]);

    // 搜索防抖处理
    const handleSearchDebounce = useCallback(() => {
        setSearchKeyword(searchInput);
        setCurrentPage(1);
        updateURL({ q: searchInput, page: 1 });
    }, [searchInput, updateURL]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearchDebounce();
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [handleSearchDebounce]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchKeyword('');
        updateURL({ q: '' });
    };

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
                    <h2 className="text-xl font-bold mb-2">校园生活</h2>
                    <p className="text-sm text-default-600">生活好物推荐</p>
                </div>

                {/* 搜索框 */}
                <div className="mb-3">
                    <Input
                        placeholder="搜索名称、位置、地址..."
                        value={searchInput}
                        onValueChange={handleSearchChange}
                        onClear={handleClearSearch}
                        isClearable
                        startContent={<Search size={18} className="text-default-400" />}
                        size="sm"
                        variant="bordered"
                        classNames={{
                            input: 'text-sm',
                            inputWrapper: 'h-10',
                        }}
                    />
                </div>

                {/* 统计信息 */}
                {!loading && (
                    <div className="flex justify-between items-center mb-3 text-sm text-default-500">
                        <span>
                            {searchKeyword.trim() ? `搜索到 ${total} 条` : `找到 ${total} 条`}
                            {searchKeyword.trim() && (
                                <span className="ml-2 text-primary">"{searchKeyword}"</span>
                            )}
                        </span>
                        <span>
                            第 {currentPage}/{totalPages} 页
                        </span>
                    </div>
                )}

                {/* 列表 */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <p className="text-default-500">加载中...</p>
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className="text-center py-8 text-default-500">暂无数据</div>
                    ) : (
                        restaurants.map((restaurant) => (
                            <Card
                                key={restaurant.id}
                                className="w-full"
                                isPressable
                                onPress={() => router.push(`/life/${restaurant.id}`)}
                            >
                                <CardBody className="p-3">
                                    <div className="flex gap-3">
                                        {/* 图片 */}
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-default-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                {restaurant.cover ? (
                                                    <ImageViewer
                                                        src={restaurant.cover}
                                                        alt={restaurant.name}
                                                        thumbnailClassName="w-20 h-20 rounded-lg"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-default-500">
                                                        图片
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 信息 */}
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
                                                    {RestaurantTypeLabels[
                                                        restaurant.type as keyof typeof RestaurantTypeLabels
                                                    ] || restaurant.type}
                                                </Chip>
                                                {restaurant.openTime &&
                                                    !restaurant.openTime.includes(
                                                        '营业时间请咨询'
                                                    ) && (
                                                        <span className="text-xs text-green-600 font-medium">
                                                            营业时间：{restaurant.openTime}
                                                        </span>
                                                    )}
                                            </div>

                                            {((restaurant.locationDescription &&
                                                restaurant.locationDescription.trim() !== '' &&
                                                !restaurant.locationDescription.includes(
                                                    '位置不详'
                                                ) &&
                                                !restaurant.locationDescription.includes(
                                                    '不知道'
                                                )) ||
                                                (restaurant.phone &&
                                                    restaurant.phone.trim() !== '')) && (
                                                <div className="flex items-center text-xs text-default-500 mb-2">
                                                    {restaurant.locationDescription &&
                                                        restaurant.locationDescription.trim() !==
                                                            '' &&
                                                        !restaurant.locationDescription.includes(
                                                            '位置不详'
                                                        ) &&
                                                        !restaurant.locationDescription.includes(
                                                            '不知道'
                                                        ) && (
                                                            <>
                                                                <MapPin
                                                                    size={12}
                                                                    className="mr-1"
                                                                />
                                                                <span className="truncate">
                                                                    {restaurant.locationDescription}
                                                                </span>
                                                            </>
                                                        )}
                                                    {restaurant.phone &&
                                                        restaurant.phone.trim() !== '' && (
                                                            <span
                                                                className={
                                                                    restaurant.locationDescription &&
                                                                    restaurant.locationDescription.trim() !==
                                                                        '' &&
                                                                    !restaurant.locationDescription.includes(
                                                                        '位置不详'
                                                                    ) &&
                                                                    !restaurant.locationDescription.includes(
                                                                        '不知道'
                                                                    )
                                                                        ? 'ml-2'
                                                                        : ''
                                                                }
                                                            >
                                                                电话：{restaurant.phone}
                                                            </span>
                                                        )}
                                                </div>
                                            )}

                                            <p className="text-xs text-default-600 line-clamp-2 mb-2">
                                                {restaurant.description}
                                            </p>

                                            <div className="flex flex-wrap gap-1">
                                                {restaurant.blackCardAccepted && (
                                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded font-medium">
                                                        黑卡可用
                                                    </span>
                                                )}
                                                {restaurant.tags.length > 0 &&
                                                    restaurant.tags
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
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>

                {/* 分页组件 */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 mb-4">
                        <Pagination
                            isCompact
                            showControls
                            total={totalPages}
                            page={currentPage}
                            onChange={(page) => {
                                setCurrentPage(page);
                                updateURL({ page });
                            }}
                            color="primary"
                            size="sm"
                        />
                    </div>
                )}
            </section>
        </>
    );
}

export default function LifePage() {
    return (
        <Suspense
            fallback={
                <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-default-500">加载中...</p>
                </div>
            }
        >
            <LifePageContent />
        </Suspense>
    );
}
