'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Chip, Pagination, Input } from '@heroui/react';
import { MapPin, Star, Loader2, Search } from 'lucide-react';

import { ImageViewer } from '@/components/common/image-viewer';
import { Restaurant, RestaurantSearchItem, RestaurantTypeLabels } from '@/types/restaurant';
import { searchRestaurants, getCachedSearchData, setCachedSearchData } from '@/lib/search-utils';

// 分类到后端枚举的映射
const categoryToTypeMap: Record<string, string> = {
    校园食堂: 'campusfood',
    主食: 'mainfood',
    饮品店: 'drinks',
    夜市: 'nightmarket',
    水果: 'fruit',
    甜品: 'dessert',
    小吃: 'snacks',
};

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

const categories = ['全部', '校园食堂', '主食', '饮品店', '夜市', '水果', '甜品', '小吃'];

export default function FoodPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [currentPage, setCurrentPage] = useState(1);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词（实际生效的）
    const [searchInput, setSearchInput] = useState(''); // 搜索输入框的值（用于防抖）
    const [searchData, setSearchData] = useState<RestaurantSearchItem[]>([]); // 本地搜索数据
    const [searchDataLoading, setSearchDataLoading] = useState(true); // 搜索数据加载状态
    const [categoryBeforeSearch, setCategoryBeforeSearch] = useState('全部'); // 搜索前的分类（用于恢复）
    const itemsPerPage = 10;

    // 使用ref跟踪上一次的分类,用于检测分类是否变化
    const prevCategoryRef = useRef(selectedCategory);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 防抖定时器

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
                    // 缓存到本地
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

    // 加载餐厅数据
    useEffect(() => {
        // 等待搜索数据加载完成
        if (searchDataLoading) {
            return;
        }

        // 检测分类是否变化
        const categoryChanged = prevCategoryRef.current !== selectedCategory;

        // 如果分类变化且当前页不是第1页,先不加载数据,等待页码重置
        if (categoryChanged && currentPage !== 1) {
            prevCategoryRef.current = selectedCategory;
            setCurrentPage(1); // 重置页码,会触发下一次useEffect
            return;
        }

        // 更新ref
        prevCategoryRef.current = selectedCategory;

        let cancelled = false;

        const loadRestaurants = async () => {
            setLoading(true);
            try {
                const params: any = {
                    page: currentPage,
                    limit: itemsPerPage,
                };

                let response;

                // 智能切换：有搜索关键词时使用本地搜索+服务器获取详情，否则使用列表API
                if (searchKeyword.trim()) {
                    // 1. 本地搜索获取匹配的ID列表
                    const matchedIds = searchRestaurants(searchKeyword, searchData);

                    if (matchedIds.length === 0) {
                        // 没有匹配结果
                        if (!cancelled) {
                            setRestaurants([]);
                            setTotal(0);
                            setLoading(false);
                        }
                        return;
                    }

                    // 2. 根据分类过滤（如果不是"全部"）
                    let filteredIds = matchedIds;
                    if (selectedCategory !== '全部') {
                        const typeValue = categoryToTypeMap[selectedCategory] || selectedCategory;
                        const filteredSearchData = searchData.filter(
                            (item) => item.type === typeValue && matchedIds.includes(item.id)
                        );
                        filteredIds = filteredSearchData.map((item) => item.id);
                    }

                    // 3. 分页处理
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedIds = filteredIds.slice(startIndex, endIndex);

                    // 4. 根据ID批量获取完整数据
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
                            // 按照搜索结果的顺序排序
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
                    // 使用列表API（原有逻辑）
                    if (selectedCategory !== '全部') {
                        params.type = categoryToTypeMap[selectedCategory] || selectedCategory;
                    }
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
                    console.error('加载餐厅数据失败:', error);
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
    }, [currentPage, selectedCategory, searchKeyword, itemsPerPage, searchData, searchDataLoading]);

    // 搜索防抖处理 - 使用 useCallback 避免闭包问题
    const handleSearchDebounce = useCallback(() => {
        const isStartingSearch = searchInput.trim() && !searchKeyword.trim();
        const isClearingSearch = !searchInput.trim() && searchKeyword.trim();

        // 开始搜索时，保存当前分类并切换到"全部"
        if (isStartingSearch) {
            setCategoryBeforeSearch(selectedCategory);
            if (selectedCategory !== '全部') {
                setSelectedCategory('全部');
            }
        }

        // 清空搜索时，恢复之前的分类
        if (isClearingSearch) {
            if (categoryBeforeSearch !== '全部' && categoryBeforeSearch) {
                setSelectedCategory(categoryBeforeSearch);
            }
        }

        setSearchKeyword(searchInput);
        setCurrentPage(1); // 搜索时重置页码
    }, [searchInput, searchKeyword, selectedCategory, categoryBeforeSearch]);

    useEffect(() => {
        // 清除之前的定时器
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // 设置新的定时器（300ms防抖）
        searchTimeoutRef.current = setTimeout(() => {
            handleSearchDebounce();
        }, 300);

        // 清理函数
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [handleSearchDebounce]);

    // 切换分类处理函数
    const handleCategoryChange = (category: string) => {
        if (category !== selectedCategory) {
            setSelectedCategory(category);
            // 页码重置会在useEffect中自动处理
        }
    };

    // 处理搜索输入变化
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    // 清空搜索
    const handleClearSearch = () => {
        setSearchInput('');
        setSearchKeyword('');
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
                    <h2 className="text-xl font-bold mb-2">校园美食</h2>
                    <p className="text-sm text-default-600">发现湖大周边美味</p>
                </div>

                {/* 搜索框 */}
                <div className="mb-3">
                    <Input
                        placeholder="搜索餐厅名称、位置、地址..."
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

                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            variant={selectedCategory === category ? 'solid' : 'flat'}
                            color={selectedCategory === category ? 'primary' : 'default'}
                            size="sm"
                            onClick={() => handleCategoryChange(category)}
                            className="cursor-pointer"
                        >
                            {category}
                        </Chip>
                    ))}
                </div>

                {/* 商户统计信息 */}
                {!loading && (
                    <div className="flex justify-between items-center mb-3 text-sm text-default-500">
                        <span>
                            {searchKeyword.trim()
                                ? `搜索到 ${total} 家餐厅`
                                : `找到 ${total} 家餐厅`}
                            {searchKeyword.trim() && (
                                <span className="ml-2 text-primary">"{searchKeyword}"</span>
                            )}
                        </span>
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
                            <Card
                                key={restaurant.id}
                                className="w-full"
                                isPressable
                                onPress={() => router.push(`/food/${restaurant.id}`)}
                            >
                                <CardBody className="p-3">
                                    <div className="flex gap-3">
                                        {/* 餐厅图片 */}
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
                    <div className="flex justify-center mt-6 mb-4">
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
