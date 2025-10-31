'use client';

import type { Config } from '@/types';

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
    Chip,
} from '@heroui/react';
import { Settings } from 'lucide-react';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';
import { PracticalDataTable } from '@/components/common/practical-data-table';
import { adminService } from '@/services/admin';

export default function ConfigPage() {
    return (
        <AdminGuard>
            <ConfigPageWithLayout />
        </AdminGuard>
    );
}

function ConfigPageWithLayout() {
    const { user, adminStats, logout } = useAdmin();

    return (
        <AdminLayout user={user || undefined} adminStats={adminStats} onLogout={logout}>
            <ConfigManagement />
        </AdminLayout>
    );
}

function ConfigManagement() {
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<Config | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // 表单数据
    const [formData, setFormData] = useState({
        key: '',
        value: '',
        description: '',
    });

    // 获取配置列表
    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const response = await adminService.getConfigList({
                keyword: searchTerm || undefined,
                limit: 100,
            });

            if (response.status === 'success' && response.data) {
                setConfigs(response.data.list);
            }
        } catch (error) {
            console.error('获取配置列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载和搜索变化时重新获取
    useEffect(() => {
        fetchConfigs();
    }, [searchTerm]);

    // 表格列定义
    const columns = [
        {
            key: 'key',
            label: '配置键',
            sortable: true,
            render: (item: Config) => (
                <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-default-100 rounded text-sm">{item.key}</code>
                    {item.key === 'food_password' && (
                        <Chip size="sm" color="warning" variant="flat">
                            美食口令
                        </Chip>
                    )}
                </div>
            ),
        },
        {
            key: 'value',
            label: '配置值',
            render: (item: Config) => (
                <div className="max-w-md">
                    <p className="line-clamp-2 font-mono text-sm">{item.value}</p>
                </div>
            ),
        },
        {
            key: 'description',
            label: '说明',
            render: (item: Config) => (
                <div className="max-w-xs">
                    <p className="line-clamp-1 text-sm text-default-600">
                        {item.description || '-'}
                    </p>
                </div>
            ),
        },
        {
            key: 'updatedAt',
            label: '更新时间',
            width: '150px',
        },
    ];

    // 处理添加
    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            key: '',
            value: '',
            description: '',
        });
        onOpen();
    };

    // 处理编辑
    const handleEdit = (item: Config) => {
        setEditingItem(item);
        setFormData({
            key: item.key,
            value: item.value,
            description: item.description || '',
        });
        onOpen();
    };

    // 处理删除
    const handleDelete = async (item: Config) => {
        if (!confirm(`确定要删除配置 "${item.key}" 吗？此操作无法撤销。`)) {
            return;
        }

        try {
            const response = await adminService.deleteConfig(item.key);
            if (response.status === 'success') {
                await fetchConfigs();
                alert('配置删除成功！');
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
        if (!formData.key.trim() || !formData.value.trim()) {
            alert('配置键和值不能为空');
            return;
        }

        setFormLoading(true);
        try {
            if (editingItem) {
                const response = await adminService.updateConfig(editingItem.key, {
                    value: formData.value,
                    description: formData.description || undefined,
                });
                if (response.status === 'success') {
                    await fetchConfigs();
                    onClose();
                    alert('配置更新成功！');
                } else {
                    alert('更新失败：' + (response.message || '未知错误'));
                }
            } else {
                const response = await adminService.createConfig(formData);
                if (response.status === 'success') {
                    await fetchConfigs();
                    onClose();
                    alert('配置创建成功！');
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
            {/* 使用实用数据表格 */}
            <PracticalDataTable
                title="配置管理"
                columns={columns}
                data={configs}
                loading={loading}
                searchPlaceholder="搜索配置键或说明..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterOptions={[]}
                filterValue={''}
                onFilterChange={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                addButtonText="添加配置"
                emptyMessage="暂无配置数据"
            />

            {/* 表单弹窗 */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            {editingItem ? '编辑配置' : '添加配置'}
                        </div>
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <Input
                            label="配置键"
                            placeholder="例如：food_password"
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                            isRequired
                            isDisabled={!!editingItem}
                            description={editingItem ? '配置键不可修改' : '配置的唯一标识符'}
                        />

                        <Textarea
                            label="配置值"
                            placeholder="请输入配置值"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            minRows={3}
                            isRequired
                            description="配置的具体内容"
                        />

                        <Textarea
                            label="说明"
                            placeholder="请输入配置说明（可选）"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            minRows={2}
                            description="配置的用途说明"
                        />
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
