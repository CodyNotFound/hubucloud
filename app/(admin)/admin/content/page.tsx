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
    Switch,
} from '@heroui/react';
import { Store } from 'lucide-react';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';
import { PracticalDataTable } from '@/components/common/practical-data-table';
import { MultiImageUpload, ImageUpload, imageUtils } from '@/components/common/image-upload';
import { adminService } from '@/services/admin';

export default function ContentPage() {
    return (
        <AdminGuard>
            <ContentPageWithLayout />
        </AdminGuard>
    );
}

function ContentPageWithLayout() {
    const { user, adminStats, logout } = useAdmin();

    return (
        <AdminLayout user={user || undefined} adminStats={adminStats} onLogout={logout}>
            <ContentManagement />
        </AdminLayout>
    );
}

function ContentManagement() {
    const [contents, setContents] = useState<Restaurant[]>([]);
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
        orderQrCode: '', // 点餐码/二维码
        blackCardAccepted: false, // 黑卡可用
    });

    // 内容类型选项（仅生活和娱乐）
    const contentTypes = ['生活', '娱乐'];

    // 类型映射：前端显示 -> 后端枚举
    const typeMapping = {
        生活: 'life',
        娱乐: 'entertainment',
    };

    // 反向映射：后端枚举 -> 前端显示
    const reverseTypeMapping = {
        life: '生活',
        entertainment: '娱乐',
    };

    // 获取内容列表
    const fetchContents = async () => {
        setLoading(true);
        try {
            // 将筛选类型从中文转换为英文枚举
            const filterType =
                selectedType !== 'all'
                    ? typeMapping[selectedType as keyof typeof typeMapping] || selectedType
                    : undefined;

            console.log('🔍 筛选条件调试:', {
                选择的类型: selectedType,
                转换后类型: filterType,
                搜索关键词: searchTerm,
            });

            const response = await adminService.getContentList({
                keyword: searchTerm || undefined,
                type: filterType,
            });

            if (response.status === 'success' && response.data) {
                setContents(response.data.list || []);
            }
        } catch (error) {
            console.error('获取内容列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载和搜索/筛选变化时重新获取
    useEffect(() => {
        fetchContents();
    }, [searchTerm, selectedType]);

    // 表格列定义
    const columns = [
        {
            key: 'name',
            label: '名称',
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
            orderQrCode: '',
            blackCardAccepted: false,
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
            orderQrCode: item.orderQrCode || '',
            blackCardAccepted: item.blackCardAccepted || false,
        });
        onOpen();
    };

    // 处理删除
    const handleDelete = async (item: Restaurant) => {
        if (!confirm(`确定要删除"${item.name}"吗？此操作无法撤销。`)) {
            return;
        }

        try {
            const response = await adminService.deleteContent(item.id);
            if (response.status === 'success') {
                await fetchContents(); // 重新加载数据
                alert('删除成功！');
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
            alert('请填写名称');
            return;
        }

        setFormLoading(true);
        try {
            // 准备提交数据，包含所有字段
            const previewUrls = imageUtils.getImageUrls(formData.preview);
            const mappedType =
                typeMapping[formData.type as keyof typeof typeMapping] || formData.type;

            console.log('🔍 类型映射调试:', {
                前端类型: formData.type,
                映射后类型: mappedType,
                类型映射表: typeMapping,
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
                const response = await adminService.updateContent(editingItem.id, submitData);
                if (response.status === 'success') {
                    await fetchContents();
                    onClose();
                    alert('更新成功！');
                } else {
                    alert('更新失败：' + (response.message || '未知错误'));
                }
            } else {
                // 创建
                const response = await adminService.createContent(submitData);
                if (response.status === 'success') {
                    await fetchContents();
                    onClose();
                    alert('创建成功！');
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
                title="其他内容管理"
                columns={columns}
                data={contents}
                loading={loading}
                searchPlaceholder="搜索名称或地址..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterOptions={[
                    { key: 'all', label: '全部类型' },
                    ...contentTypes.map((type) => ({ key: type, label: type })),
                ]}
                filterValue={selectedType}
                onFilterChange={setSelectedType}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                addButtonText="添加内容"
                emptyMessage="暂无数据"
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
                            {editingItem ? '编辑内容' : '添加内容'}
                        </div>
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="名称"
                                placeholder="请输入名称"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                isRequired
                            />

                            <Select
                                label="类型"
                                placeholder="选择类型"
                                selectedKeys={formData.type ? [formData.type] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setFormData({ ...formData, type: selected || '' });
                                }}
                            >
                                {contentTypes.map((type) => (
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
                                    label="地址"
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
                                    label="描述"
                                    placeholder="请详细描述特色、环境等"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-2 block">图片</label>
                                <MultiImageUpload
                                    value={formData.preview}
                                    onChange={(urls) => setFormData({ ...formData, preview: urls })}
                                    onError={setUploadError}
                                    maxCount={6}
                                />
                                <p className="text-xs text-default-400 mt-1">最多上传6张图片</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-2 block">二维码</label>
                                <ImageUpload
                                    value={formData.orderQrCode}
                                    onChange={(url) =>
                                        setFormData({ ...formData, orderQrCode: url })
                                    }
                                    onError={setUploadError}
                                    placeholder="点击上传二维码(可选)"
                                />
                                <p className="text-xs text-default-400 mt-1">
                                    上传相关的小程序码或二维码（如微信、支付宝等）
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <Switch
                                    isSelected={formData.blackCardAccepted}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, blackCardAccepted: value })
                                    }
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium">黑卡可用</p>
                                        <p className="text-xs text-default-400">
                                            该商家是否支持黑卡优惠
                                        </p>
                                    </div>
                                </Switch>
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
