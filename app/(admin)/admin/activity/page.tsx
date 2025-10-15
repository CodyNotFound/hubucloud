'use client';

import type { Activity } from '@/types/activity';

import { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Switch,
    Chip,
    Select,
    SelectItem,
} from '@heroui/react';
import { Calendar } from 'lucide-react';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';
import { PracticalDataTable } from '@/components/common/practical-data-table';
import { adminService } from '@/services/admin';
import { MultiImageUpload, imageUtils, type ImageItem } from '@/components/common/image-upload';

export default function ActivityPage() {
    return (
        <AdminGuard>
            <ActivityPageWithLayout />
        </AdminGuard>
    );
}

function ActivityPageWithLayout() {
    const { user, adminStats, logout } = useAdmin();

    return (
        <AdminLayout user={user || undefined} adminStats={adminStats} onLogout={logout}>
            <ActivityManagement />
        </AdminLayout>
    );
}

function ActivityManagement() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<Activity | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // 表单数据
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        images: [] as ImageItem[],
        enabled: true,
        type: 'TEXT' as 'IMAGE' | 'TEXT',
        imageUrl: '',
        buttonText: '确定',
        autoOpen: true,
    });

    // 获取活动列表
    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await adminService.getActivityList({
                keyword: searchTerm || undefined,
                limit: 100,
            });

            if (response.status === 'success' && response.data) {
                setActivities(response.data.list);
            }
        } catch (error) {
            console.error('获取活动列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载和搜索/筛选变化时重新获取
    useEffect(() => {
        fetchActivities();
    }, [searchTerm]);

    // 表格列定义
    const columns = [
        {
            key: 'title',
            label: '标题',
            sortable: true,
            width: '200px',
            render: (item: Activity) => (
                <div className="max-w-xs">
                    <p className="font-medium line-clamp-1">{item.title}</p>
                </div>
            ),
        },
        {
            key: 'content',
            label: '内容',
            sortable: true,
            render: (item: Activity) => (
                <div className="max-w-md">
                    <p className="line-clamp-2">{item.content}</p>
                </div>
            ),
        },
        {
            key: 'images',
            label: '图片',
            width: '100px',
            render: (item: Activity) => (
                <Chip
                    size="sm"
                    variant="flat"
                    color={item.images.length > 0 ? 'primary' : 'default'}
                >
                    {item.images.length} 张
                </Chip>
            ),
        },
        {
            key: 'enabled',
            label: '状态',
            width: '100px',
            render: (item: Activity) => (
                <Chip size="sm" variant="flat" color={item.enabled ? 'success' : 'default'}>
                    {item.enabled ? '已启用' : '已禁用'}
                </Chip>
            ),
        },
        {
            key: 'createdAt',
            label: '发布时间',
            width: '100px',
        },
    ];

    // 处理添加
    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            content: '',
            images: [],
            enabled: true,
            type: 'TEXT',
            imageUrl: '',
            buttonText: '确定',
            autoOpen: true,
        });
        onOpen();
    };

    // 处理编辑
    const handleEdit = (item: Activity) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            images: imageUtils.createFromUrls(item.images || []),
            enabled: item.enabled,
            type: item.type || 'TEXT',
            imageUrl: item.imageUrl || '',
            buttonText: item.buttonText || '确定',
            autoOpen: item.autoOpen ?? true,
        });
        onOpen();
    };

    // 处理删除
    const handleDelete = async (item: Activity) => {
        if (!confirm(`确定要删除这条活动吗？此操作无法撤销。`)) {
            return;
        }

        try {
            const response = await adminService.deleteActivity(item.id);
            if (response.status === 'success') {
                await fetchActivities();
                alert('活动删除成功！');
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
        if (!formData.title.trim()) {
            alert('请填写活动标题');
            return;
        }
        if (!formData.content.trim()) {
            alert('请填写活动内容');
            return;
        }

        setFormLoading(true);
        try {
            const submitData = {
                title: formData.title,
                content: formData.content,
                images: imageUtils.getImageUrls(formData.images),
                enabled: formData.enabled,
                type: formData.type,
                imageUrl: formData.imageUrl,
                buttonText: formData.buttonText,
                autoOpen: formData.autoOpen,
            };

            if (editingItem) {
                const response = await adminService.updateActivity(editingItem.id, submitData);
                if (response.status === 'success') {
                    await fetchActivities();
                    onClose();
                    alert('活动更新成功！');
                } else {
                    alert('更新失败：' + (response.message || '未知错误'));
                }
            } else {
                const response = await adminService.createActivity(submitData);
                if (response.status === 'success') {
                    await fetchActivities();
                    onClose();
                    alert('活动发布成功！');
                } else {
                    alert('发布失败：' + (response.message || '未知错误'));
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
                title="活动管理"
                columns={columns}
                data={activities}
                loading={loading}
                searchPlaceholder="搜索活动内容..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterOptions={[]}
                filterValue={''}
                onFilterChange={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                addButtonText="发布活动"
                emptyMessage="暂无活动数据"
            />

            {/* 表单弹窗 */}
            <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {editingItem ? '编辑活动' : '发布活动'}
                        </div>
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <Input
                            label="活动标题"
                            placeholder="请输入活动标题"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            isRequired
                            description="弹窗显示的标题"
                        />

                        <Textarea
                            label="活动内容"
                            placeholder=""
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            minRows={6}
                            isRequired
                            description="用户首次打开活动页面时会自动弹窗显示"
                        />

                        {/* 多图片上传 */}
                        <div>
                            <p className="text-sm font-medium mb-2">活动图片（最多9张）</p>
                            <MultiImageUpload
                                value={formData.images}
                                onChange={(images) => setFormData({ ...formData, images })}
                                onError={(error) => alert(error)}
                                maxCount={9}
                                maxSize={20}
                            />
                        </div>

                        <Select
                            label="展示类型"
                            placeholder="选择展示类型"
                            selectedKeys={[formData.type]}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value as 'IMAGE' | 'TEXT',
                                })
                            }
                            description="选择弹窗内容的展示方式"
                        >
                            <SelectItem key="TEXT">文字内容</SelectItem>
                            <SelectItem key="IMAGE">图片海报</SelectItem>
                        </Select>

                        {formData.type === 'IMAGE' && (
                            <Input
                                label="图片URL"
                                placeholder="请输入图片URL"
                                value={formData.imageUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, imageUrl: e.target.value })
                                }
                                description="弹窗中显示的图片地址"
                            />
                        )}

                        <Input
                            label="按钮文字"
                            placeholder="确定"
                            value={formData.buttonText}
                            onChange={(e) =>
                                setFormData({ ...formData, buttonText: e.target.value })
                            }
                            description="弹窗底部按钮显示的文字"
                        />

                        <Switch
                            isSelected={formData.autoOpen}
                            onValueChange={(value) => setFormData({ ...formData, autoOpen: value })}
                        >
                            自动打开弹窗
                        </Switch>

                        <Switch
                            isSelected={formData.enabled}
                            onValueChange={(value) => setFormData({ ...formData, enabled: value })}
                        >
                            启用活动
                        </Switch>

                        <div className="text-xs text-default-500 bg-default-50 p-3 rounded-lg">
                            <p className="font-medium mb-1">💡 温馨提示：</p>
                            <ul className="space-y-1 pl-4 list-disc">
                                <li>用户首次打开活动页面时会自动弹窗显示</li>
                                <li>弹窗在一天内只显示一次</li>
                                <li>用户可以选择"不再显示"永久关闭当前活动</li>
                                <li>图片支持JPG、PNG、GIF、WebP格式，最大20MB</li>
                            </ul>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose} disabled={formLoading}>
                            取消
                        </Button>
                        <Button color="primary" onPress={handleSubmit} isLoading={formLoading}>
                            {editingItem ? '更新' : '发布'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
