'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody, Chip, Input, Button, Select, SelectItem, Pagination } from '@heroui/react';
import { Search, MapPin, Star, Filter, ArrowUpDown } from 'lucide-react';

// 美食商户数据类型
interface FoodVendor {
    id: string;
    name: string;
    category: string;
    rating: number;
    averagePrice: number;
    distance: number;
    image: string;
    address: string;
    specialties: string[];
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

// 模拟数据
const mockVendors: FoodVendor[] = [
    {
        id: '1',
        name: '湖大食堂一楼',
        category: '中式快餐',
        rating: 4.5,
        averagePrice: 15,
        distance: 100,
        image: '/images/food1.jpg',
        address: '湖北大学第一食堂一楼',
        specialties: ['红烧肉', '宫保鸡丁', '麻婆豆腐'],
        isOpen: true,
        openTime: '06:30',
        closeTime: '20:30',
    },
    {
        id: '2',
        name: '麻辣香锅',
        category: '川湘菜',
        rating: 4.2,
        averagePrice: 25,
        distance: 200,
        image: '/images/food2.jpg',
        address: '湖北大学商业街',
        specialties: ['麻辣香锅', '水煮鱼', '辣子鸡'],
        isOpen: true,
        openTime: '10:00',
        closeTime: '22:00',
    },
    {
        id: '3',
        name: '兰州拉面',
        category: '西北面食',
        rating: 4.3,
        averagePrice: 18,
        distance: 150,
        image: '/images/food3.jpg',
        address: '湖北大学北门小吃街',
        specialties: ['兰州拉面', '刀削面', '炸酱面'],
        isOpen: false,
        openTime: '07:00',
        closeTime: '21:00',
    },
    {
        id: '4',
        name: '韩式炸鸡',
        category: '韩式料理',
        rating: 4.1,
        averagePrice: 35,
        distance: 300,
        image: '/images/food4.jpg',
        address: '湖北大学东门商圈',
        specialties: ['韩式炸鸡', '部队锅', '石锅拌饭'],
        isOpen: true,
        openTime: '11:00',
        closeTime: '23:00',
    },
    {
        id: '5',
        name: '黄焖鸡米饭',
        category: '中式快餐',
        rating: 3.9,
        averagePrice: 20,
        distance: 180,
        image: '/images/food5.jpg',
        address: '湖北大学西门美食街',
        specialties: ['黄焖鸡', '排骨饭', '牛肉面'],
        isOpen: true,
        openTime: '09:00',
        closeTime: '21:30',
    },
    {
        id: '6',
        name: '日式料理',
        category: '日式料理',
        rating: 4.6,
        averagePrice: 45,
        distance: 400,
        image: '/images/food6.jpg',
        address: '湖北大学南门商业中心',
        specialties: ['寿司', '拉面', '天妇罗'],
        isOpen: true,
        openTime: '11:30',
        closeTime: '22:30',
    },
    {
        id: '7',
        name: '川味牛肉面',
        category: '川湘菜',
        rating: 4.0,
        averagePrice: 22,
        distance: 250,
        image: '/images/food7.jpg',
        address: '湖北大学东门美食城',
        specialties: ['川味牛肉面', '酸菜鱼', '口水鸡'],
        isOpen: true,
        openTime: '08:00',
        closeTime: '22:00',
    },
    {
        id: '8',
        name: '粤式茶餐厅',
        category: '粤菜',
        rating: 4.4,
        averagePrice: 38,
        distance: 350,
        image: '/images/food8.jpg',
        address: '湖北大学南门广场',
        specialties: ['港式茶餐', '叉烧包', '煲仔饭'],
        isOpen: true,
        openTime: '09:00',
        closeTime: '23:30',
    },
    {
        id: '9',
        name: '老北京炸酱面',
        category: '西北面食',
        rating: 3.8,
        averagePrice: 16,
        distance: 120,
        image: '/images/food9.jpg',
        address: '湖北大学北门小巷',
        specialties: ['炸酱面', '卤煮火烧', '豆汁焦圈'],
        isOpen: true,
        openTime: '07:30',
        closeTime: '21:00',
    },
    {
        id: '10',
        name: '泰式料理',
        category: '东南亚菜',
        rating: 4.3,
        averagePrice: 42,
        distance: 480,
        image: '/images/food10.jpg',
        address: '湖北大学商圈中心',
        specialties: ['冬阴功汤', '泰式炒河粉', '芒果糯米饭'],
        isOpen: false,
        openTime: '11:00',
        closeTime: '22:30',
    },
    {
        id: '11',
        name: '湖大食堂二楼',
        category: '中式快餐',
        rating: 4.1,
        averagePrice: 18,
        distance: 80,
        image: '/images/food11.jpg',
        address: '湖北大学第一食堂二楼',
        specialties: ['小炒肉', '蒸蛋', '紫菜蛋花汤'],
        isOpen: true,
        openTime: '06:30',
        closeTime: '20:30',
    },
    {
        id: '12',
        name: '重庆小面',
        category: '川湘菜',
        rating: 4.2,
        averagePrice: 19,
        distance: 220,
        image: '/images/food12.jpg',
        address: '湖北大学西门步行街',
        specialties: ['重庆小面', '酸辣粉', '抄手'],
        isOpen: true,
        openTime: '08:30',
        closeTime: '21:30',
    },
    {
        id: '13',
        name: '意大利披萨',
        category: '西式料理',
        rating: 4.0,
        averagePrice: 55,
        distance: 520,
        image: '/images/food13.jpg',
        address: '湖北大学商业中心二楼',
        specialties: ['玛格丽特披萨', '意大利面', '提拉米苏'],
        isOpen: true,
        openTime: '10:30',
        closeTime: '23:00',
    },
    {
        id: '14',
        name: '云南过桥米线',
        category: '云贵菜',
        rating: 4.5,
        averagePrice: 26,
        distance: 280,
        image: '/images/food14.jpg',
        address: '湖北大学东门商业街',
        specialties: ['过桥米线', '汽锅鸡', '鲜花饼'],
        isOpen: true,
        openTime: '09:00',
        closeTime: '22:00',
    },
    {
        id: '15',
        name: '烤肉店',
        category: '韩式料理',
        rating: 3.9,
        averagePrice: 68,
        distance: 380,
        image: '/images/food15.jpg',
        address: '湖北大学南门商圈',
        specialties: ['韩式烤肉', '泡菜汤', '韩式拌饭'],
        isOpen: true,
        openTime: '11:30',
        closeTime: '24:00',
    },
];

const categories = [
    '全部',
    '中式快餐',
    '川湘菜',
    '西北面食',
    '韩式料理',
    '日式料理',
    '粤菜',
    '东南亚菜',
    '西式料理',
    '云贵菜',
];
const priceRanges = [
    { label: '全部价位', value: 'all' },
    { label: '15元以下', value: '0-15' },
    { label: '15-25元', value: '15-25' },
    { label: '25-35元', value: '25-35' },
    { label: '35元以上', value: '35-999' },
];
const sortOptions = [
    { label: '推荐排序', value: 'recommend' },
    { label: '评分最高', value: 'rating' },
    { label: '价格最低', value: 'price-low' },
    { label: '距离最近', value: 'distance' },
];

export default function FoodPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('recommend');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // 每页显示5个商户

    // 筛选和排序逻辑
    const filteredAndSortedVendors = useMemo(() => {
        return mockVendors
            .filter((vendor) => {
                // 搜索过滤
                if (
                    searchTerm &&
                    !vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !vendor.specialties.some((s) => s.includes(searchTerm))
                ) {
                    return false;
                }

                // 分类过滤
                if (selectedCategory !== '全部' && vendor.category !== selectedCategory) {
                    return false;
                }

                // 价格过滤
                if (selectedPriceRange !== 'all') {
                    const [min, max] = selectedPriceRange.split('-').map(Number);
                    if (vendor.averagePrice < min || vendor.averagePrice > max) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'rating':
                        return b.rating - a.rating;
                    case 'price-low':
                        return a.averagePrice - b.averagePrice;
                    case 'distance':
                        return a.distance - b.distance;
                    default:
                        return b.rating - a.rating; // 默认按评分排序
                }
            });
    }, [searchTerm, selectedCategory, selectedPriceRange, sortBy]);

    // 分页逻辑
    const totalPages = Math.ceil(filteredAndSortedVendors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVendors = filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage);

    // 当筛选条件改变时重置到第一页
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedPriceRange, sortBy]);

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

                {/* 筛选和排序按钮 */}
                <div className="flex justify-between items-center mb-4">
                    <Button
                        variant="flat"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        startContent={<Filter size={16} />}
                    >
                        筛选
                    </Button>
                    <Select
                        placeholder="排序方式"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-32"
                        size="sm"
                        startContent={<ArrowUpDown size={16} />}
                    >
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value}>{option.label}</SelectItem>
                        ))}
                    </Select>
                </div>

                {/* 筛选面板 */}
                {showFilters && (
                    <Card className="mb-4">
                        <CardBody className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">分类</h4>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <Chip
                                            key={category}
                                            variant={
                                                selectedCategory === category ? 'solid' : 'flat'
                                            }
                                            color={
                                                selectedCategory === category
                                                    ? 'primary'
                                                    : 'default'
                                            }
                                            size="sm"
                                            onClick={() => setSelectedCategory(category)}
                                            className="cursor-pointer"
                                        >
                                            {category}
                                        </Chip>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2">人均价位</h4>
                                <div className="flex flex-wrap gap-2">
                                    {priceRanges.map((range) => (
                                        <Chip
                                            key={range.value}
                                            variant={
                                                selectedPriceRange === range.value
                                                    ? 'solid'
                                                    : 'flat'
                                            }
                                            color={
                                                selectedPriceRange === range.value
                                                    ? 'primary'
                                                    : 'default'
                                            }
                                            size="sm"
                                            onClick={() => setSelectedPriceRange(range.value)}
                                            className="cursor-pointer"
                                        >
                                            {range.label}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* 商户统计信息 */}
                {filteredAndSortedVendors.length > 0 && (
                    <div className="flex justify-between items-center mb-3 text-sm text-default-500">
                        <span>找到 {filteredAndSortedVendors.length} 家商户</span>
                        <span>
                            第 {currentPage}/{totalPages} 页
                        </span>
                    </div>
                )}

                {/* 商户列表 */}
                <div className="space-y-3">
                    {filteredAndSortedVendors.length === 0 ? (
                        <div className="text-center py-8 text-default-500">暂无符合条件的商户</div>
                    ) : (
                        paginatedVendors.map((vendor) => (
                            <Card key={vendor.id} className="w-full" isPressable>
                                <CardBody className="p-3">
                                    <div className="flex gap-3">
                                        {/* 商户图片 */}
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-default-200 rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-default-500">
                                                    图片
                                                </span>
                                            </div>
                                        </div>

                                        {/* 商户信息 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-semibold text-sm truncate">
                                                    {vendor.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-orange-500">
                                                    <span className="text-sm font-medium">
                                                        {vendor.rating}
                                                    </span>
                                                    <div className="flex">
                                                        {renderStars(vendor.rating)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <Chip size="sm" variant="flat" color="primary">
                                                    {vendor.category}
                                                </Chip>
                                                <span className="text-xs text-red-500 font-medium">
                                                    ¥{vendor.averagePrice}/人
                                                </span>
                                                {vendor.isOpen ? (
                                                    <Chip size="sm" color="success" variant="flat">
                                                        营业中
                                                    </Chip>
                                                ) : (
                                                    <Chip size="sm" color="default" variant="flat">
                                                        休息中
                                                    </Chip>
                                                )}
                                            </div>

                                            <div className="flex items-center text-xs text-default-500 mb-2">
                                                <MapPin size={12} className="mr-1" />
                                                <span className="truncate">{vendor.address}</span>
                                                <span className="ml-2">{vendor.distance}m</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {vendor.specialties
                                                    .slice(0, 3)
                                                    .map((specialty, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs px-2 py-1 bg-default-100 rounded text-default-600"
                                                        >
                                                            {specialty}
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
