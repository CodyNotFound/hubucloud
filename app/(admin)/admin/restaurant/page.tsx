'use client';

import type { Restaurant } from '@/types/index';

import { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from '@heroui/react';
import { Store } from 'lucide-react';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';
import { PracticalDataTable } from '@/components/common/practical-data-table';
import { MultiImageUpload, imageUtils } from '@/components/common/image-upload';
import { adminService } from '@/services/admin';

export default function RestaurantPage() {
    return (
        <AdminGuard>
            <RestaurantPageWithLayout />
        </AdminGuard>
    );
}

function RestaurantPageWithLayout() {
    const { user, adminStats, logout } = useAdmin();

    return (
        <AdminLayout user={user || undefined} adminStats={adminStats} onLogout={logout}>
            <RestaurantManagement />
        </AdminLayout>
    );
}

function RestaurantManagement() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [editingItem, setEditingItem] = useState<Restaurant | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [_uploadError, setUploadError] = useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // 表单数据
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        address: '',
        phone: '',
        description: '',
        cover: '',
        preview: [] as any[],
        openTime: '',
        rating: 0,
        locationDescription: '',
    });

    // 餐厅类型选项
    const restaurantTypes = ['校园食堂', '主食', '饮品店', '夜市', '水果', '甜品', '小吃'];

    // 类型映射：前端显示 -> 后端枚举
    const typeMapping = {
        校园食堂: 'campusfood',
        主食: 'mainfood',
        饮品店: 'drinks',
        夜市: 'nightmarket',
        水果: 'fruit',
        甜品: 'dessert',
        小吃: 'snacks',
    };

    // 反向映射：后端枚举 -> 前端显示
    const reverseTypeMapping = {
        campusfood: '校园食堂',
        mainfood: '主食',
        drinks: '饮品店',
        nightmarket: '夜市',
        fruit: '水果',
        dessert: '甜品',
        snacks: '小吃',
    };

    // 获取餐厅列表
    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const response = await adminService.getRestaurantList({
                keyword: searchTerm || undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
            });

            if (response.status === 'success' && response.data) {
                setRestaurants(response.data.list || []);
            }
        } catch (error) {
            console.error('获取餐厅列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载和搜索/筛选变化时重新获取
    useEffect(() => {
        fetchRestaurants();
    }, [searchTerm, selectedType]);

    // 表格列定义
    const columns = [
        {
            key: 'name',
            label: '餐厅名称',
            sortable: true,
        },
        {
            key: 'type',
            label: '类型',
            width: '100px',
            render: (item: Restaurant) =>
                reverseTypeMapping[item.type as keyof typeof reverseTypeMapping] || item.type,
        },
        {
            key: 'address',
            label: '地址',
        },
        {
            key: 'phone',
            label: '电话',
            width: '120px',
        },
        {
            key: 'openTime',
            label: '营业时间',
            width: '120px',
        },
        {
            key: 'rating',
            label: '评分',
            width: '80px',
            render: (item: Restaurant) => `${item.rating}/5`,
        },
        {
            key: 'createdAt',
            label: '创建时间',
            width: '100px',
        },
    ];

    // 处理添加
    const handleAdd = () => {
        setEditingItem(null);
        setUploadError(null);
        setFormData({
            name: '',
            type: '',
            address: '',
            phone: '',
            description: '',
            cover: '',
            preview: [],
            openTime: '',
            rating: 0,
            locationDescription: '',
        });
        onOpen();
    };

    // 处理编辑
    const handleEdit = (item: Restaurant) => {
        setEditingItem(item);
        setUploadError(null);
        setFormData({
            name: item.name,
            type: reverseTypeMapping[item.type as keyof typeof reverseTypeMapping] || item.type,
            address: item.address,
            phone: item.phone,
            description: item.description,
            cover: item.cover,
            preview: imageUtils.createFromUrls(item.preview || []),
            openTime: item.openTime,
            rating: item.rating,
            locationDescription: item.locationDescription || '',
        });
        onOpen();
    };

    // 处理删除
    const handleDelete = async (item: Restaurant) => {
        if (!confirm(`确定要删除餐厅"${item.name}"吗？此操作无法撤销。`)) {
            return;
        }

        try {
            const response = await adminService.deleteRestaurant(item.id);
            if (response.status === 'success') {
                await fetchRestaurants(); // 重新加载数据
                alert('餐厅删除成功！');
            } else {
                alert('删除失败：' + (response.message || '未知错误'));
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败：' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    // 处理表单提交
    const handleSubmit = async () => {
        // 验证必填字段 - 只有名字是必须的
        if (!formData.name) {
            alert('请填写餐厅名称');
            return;
        }

        setFormLoading(true);
        try {
            // 准备提交数据，包含所有字段
            const previewUrls = imageUtils.getImageUrls(formData.preview);
            const mappedType = typeMapping[formData.type as keyof typeof typeMapping] || formData.type;

            console.log('🔍 类型映射调试:', {
                前端类型: formData.type,
                映射后类型: mappedType,
                类型映射表: typeMapping
            });

            const submitData = {
                ...formData,
                type: mappedType, // 转换为后端枚举
                preview: previewUrls, // 转换为URL数组
                cover: previewUrls.length > 0 ? previewUrls[0] : '/logo.png', // 自动设置封面：第一张图片或logo
                tags: [], // 暂时为空，后续可以添加标签功能
                latitude: 30.5418, // 默认湖北大学纬度
                longitude: 114.3468, // 默认湖北大学经度
            };

            console.log('📤 提交数据:', submitData);

            if (editingItem) {
                // 更新
                const response = await adminService.updateRestaurant(editingItem.id, submitData);
                if (response.status === 'success') {
                    await fetchRestaurants();
                    onClose();
                    alert('餐厅更新成功！');
                } else {
                    alert('更新失败：' + (response.message || '未知错误'));
                }
            } else {
                // 创建
                const response = await adminService.createRestaurant(submitData);
                if (response.status === 'success') {
                    await fetchRestaurants();
                    onClose();
                    alert('餐厅创建成功！');
                } else {
                    alert('创建失败：' + (response.message || '未知错误'));
                }
            }
        } catch (error) {
            console.error('操作失败:', error);
            alert('操作失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div>
            {/* 使用新的实用数据表格 */}
            <PracticalDataTable
                title="餐厅管理"
                columns={columns}
                data={restaurants}
                loading={loading}
                searchPlaceholder="搜索餐厅名称或地址..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterOptions={[
                    { key: 'all', label: '全部类型' },
                    ...restaurantTypes.map((type) => ({ key: type, label: type })),
                ]}
                filterValue={selectedType}
                onFilterChange={setSelectedType}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                addButtonText="添加餐厅"
                emptyMessage="暂无餐厅数据"
            />

            {/* 表单弹窗 */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="3xl"
                scrollBehavior="inside"
                className="max-h-[90vh]"
            >
                <ModalContent>
                    <ModalHeader>
                        <div className="flex items-center gap-2">
                            <Store className="w-5 h-5 text-primary" />
                            {editingItem ? '编辑餐厅' : '添加餐厅'}
                        </div>
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="餐厅名称"
                                placeholder="请输入餐厅名称"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                isRequired
                            />

                            <Select
                                label="餐厅类型"
                                placeholder="选择餐厅类型"
                                selectedKeys={formData.type ? [formData.type] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setFormData({ ...formData, type: selected || '' });
                                }}
                            >
                                {restaurantTypes.map((type) => (
                                    <SelectItem key={type}>{type}</SelectItem>
                                ))}
                            </Select>

                            <Input
                                label="联系电话"
                                placeholder="请输入联系电话"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />

                            <Input
                                label="营业时间"
                                placeholder="例如：9:00-22:00"
                                value={formData.openTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, openTime: e.target.value })
                                }
                            />

                            <Input
                                label="评分"
                                placeholder="1-5分"
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                value={formData.rating?.toString() || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        rating: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />

                            <div className="md:col-span-2">
                                <Input
                                    label="餐厅地址"
                                    placeholder="请输入详细地址"
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Input
                                    label="位置描述"
                                    placeholder="例如：湖北大学南门对面、知行大楼附近"
                                    value={formData.locationDescription}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            locationDescription: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Textarea
                                    label="餐厅描述"
                                    placeholder="请详细描述餐厅特色、环境等"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-2 block">餐厅图片</label>
                                <MultiImageUpload
                                    value={formData.preview}
                                    onChange={(urls) => setFormData({ ...formData, preview: urls })}
                                    onError={setUploadError}
                                    maxCount={6}
                                />
                                <p className="text-xs text-default-400 mt-1">
                                    最多上传6张餐厅环境或菜品图片
                                </p>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose} disabled={formLoading}>
                            取消
                        </Button>
                        <Button color="primary" onPress={handleSubmit} isLoading={formLoading}>
                            {editingItem ? '更新' : '创建'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
