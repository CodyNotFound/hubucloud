'use client';

import type { Parttime } from '@/types/parttime';

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
} from '@heroui/react';
import { Briefcase } from 'lucide-react';

import { AdminGuard } from '@/components/common/admin-guard';
import AdminLayout from '@/components/layouts/admin-layout';
import { useAdmin } from '@/hooks/use-admin';
import { PracticalDataTable } from '@/components/common/practical-data-table';
import { adminService } from '@/services/admin';
import { ContactInput } from '@/components/parttime/contact-input';
import { RequirementsInput } from '@/components/parttime/requirements-input';

interface Parttime {
    id: string;
    name: string;
    salary: string;
    worktime: string;
    location: string;
    description: string;
    contact: string;
    requirements?: string;
    tags: string[];
    createdAt: string;
}

// 模拟数据
const mockParttime: Parttime[] = [
    {
        id: '1',
        name: '外卖配送员',
        salary: '6-12元/单，日均150-300元',
        time: '弹性时间，建议11:00-14:00, 17:00-21:00',
        location: '武昌区、洪山区',
        description: '负责外卖配送工作，熟悉当地路况',
        tags: ['弹性时间', '高收入', '锻炼身体'],
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        name: '线上客服',
        salary: '16-20元/小时',
        time: '灵活时间，每天至少4小时',
        location: '在线办公',
        description: '处理客户咨询，解答问题',
        tags: ['远程办公', '灵活时间'],
        createdAt: '2024-01-14',
    },
    {
        id: '3',
        name: '咖啡厅服务员',
        salary: '20元/小时',
        time: '平日晚上 18:00-22:00',
        location: '湖北大学附近',
        description: '负责点餐、制作饮品、清洁等工作',
        tags: ['学生友好', '技能提升'],
        createdAt: '2024-01-13',
    },
    {
        id: '4',
        name: '图书馆助理',
        salary: '15元/小时',
        time: '周末 9:00-17:00',
        location: '湖北大学图书馆',
        description: '整理书籍，协助读者查找资料',
        tags: ['安静环境', '学习氛围'],
        createdAt: '2024-01-12',
    },
    {
        id: '5',
        name: '校园送餐员',
        salary: '18-25元/小时',
        time: '11:00-14:00, 17:00-20:00',
        location: '湖北大学校内',
        description: '负责校内餐饮配送',
        tags: ['校内工作', '熟悉环境'],
        createdAt: '2024-01-11',
    },
    {
        id: '6',
        name: '家教老师 - 高中数学',
        salary: '80-120元/小时',
        time: '工作日晚上 19:00-21:00',
        location: '学生家中',
        description: '辅导高中数学，要求数学基础扎实',
        tags: ['高薪酬', '专业对口', '能力提升'],
        createdAt: '2024-01-10',
    },
    {
        id: '7',
        name: '校园咖啡店服务员',
        salary: '20元/小时',
        time: '周末 9:00-18:00',
        location: '湖北大学校内咖啡店',
        description: '制作咖啡、服务客户、维护店面卫生',
        tags: ['技能学习', '社交机会', '校内便利'],
        createdAt: '2024-01-09',
    },
];

export default function ParttimePage() {
    return (
        <AdminGuard>
            <ParttimePageWithLayout />
        </AdminGuard>
    );
}

function ParttimePageWithLayout() {
    const { user, adminStats, logout } = useAdmin();

    return (
        <AdminLayout user={user || undefined} adminStats={adminStats} onLogout={logout}>
            <ParttimeManagement />
        </AdminLayout>
    );
}

function ParttimeManagement() {
    const [parttimes, setParttimes] = useState<Parttime[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<Parttime | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // 表单数据
    const [formData, setFormData] = useState({
        name: '',
        salary: '',
        worktime: '',
        location: '',
        description: '',
        contact: '',
        requirements: '',
    });

    // 获取兼职列表
    const fetchParttimes = async () => {
        setLoading(true);
        try {
            const response = await adminService.getParttimeList({
                keyword: searchTerm || undefined,
                limit: 100,
            });

            if (response.status === 'success' && response.data) {
                setParttimes(response.data.list);
            }
        } catch (error) {
            console.error('获取兼职列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 初始加载和搜索/筛选变化时重新获取
    useEffect(() => {
        fetchParttimes();
    }, [searchTerm]);

    // 表格列定义
    const columns = [
        {
            key: 'name',
            label: '职位名称',
            sortable: true,
        },
        {
            key: 'salary',
            label: '薪资',
            width: '140px',
        },
        {
            key: 'worktime',
            label: '工作时间',
            width: '160px',
        },
        {
            key: 'location',
            label: '工作地点',
            width: '140px',
        },
        {
            key: 'contact',
            label: '联系方式',
            width: '140px',
        },
        {
            key: 'requirements',
            label: '招聘要求',
            width: '120px',
            render: (item: Parttime) => (
                <span
                    className={`px-2 py-1 text-xs rounded ${
                        item.requirements?.includes('限男生')
                            ? 'bg-blue-100 text-blue-700'
                            : item.requirements?.includes('限女生')
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    {item.requirements || '无要求'}
                </span>
            ),
        },
        {
            key: 'tags',
            label: '标签',
            width: '160px',
            render: (item: Parttime) => (
                <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 2).map((tag, index) => (
                        <span
                            key={index}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                            {tag}
                        </span>
                    )) || '-'}
                    {item.tags && item.tags.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-default-100 text-xs rounded">
                            +{item.tags.length - 2}
                        </span>
                    )}
                </div>
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
            name: '',
            salary: '',
            worktime: '',
            location: '',
            description: '',
            contact: '',
            requirements: '',
        });
        onOpen();
    };

    // 处理编辑
    const handleEdit = (item: Parttime) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            salary: item.salary,
            worktime: item.worktime,
            location: item.location,
            description: item.description,
            contact: item.contact,
            requirements: item.requirements || '',
        });
        onOpen();
    };

    // 处理删除
    const handleDelete = async (item: Parttime) => {
        if (!confirm(`确定要删除兼职"${item.name}"吗？此操作无法撤销。`)) {
            return;
        }

        try {
            const response = await adminService.deleteParttime(item.id);
            if (response.status === 'success') {
                await fetchParttimes();
                alert('兼职删除成功！');
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
        if (
            !formData.name ||
            !formData.salary ||
            !formData.worktime ||
            !formData.location ||
            !formData.description ||
            !formData.contact
        ) {
            alert('请填写所有必填字段');
            return;
        }

        setFormLoading(true);
        try {
            if (editingItem) {
                const response = await adminService.updateParttime(editingItem.id, formData);
                if (response.status === 'success') {
                    await fetchParttimes();
                    onClose();
                    alert('兼职更新成功！');
                } else {
                    alert('更新失败：' + (response.message || '未知错误'));
                }
            } else {
                const response = await adminService.createParttime(formData);
                if (response.status === 'success') {
                    await fetchParttimes();
                    onClose();
                    alert('兼职创建成功！');
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
                title="兼职管理"
                columns={columns}
                data={parttimes}
                loading={loading}
                searchPlaceholder="搜索职位名称或地点..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterOptions={[]}
                filterValue={''}
                onFilterChange={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
                addButtonText="发布兼职"
                emptyMessage="暂无兼职数据"
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
                            <Briefcase className="w-5 h-5 text-primary" />
                            {editingItem ? '编辑兼职' : '发布兼职'}
                        </div>
                    </ModalHeader>
                    <ModalBody className="gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="职位名称"
                                placeholder="请输入职位名称"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                isRequired
                            />

                            <Input
                                label="薪资待遇"
                                placeholder="例如：20元/小时"
                                value={formData.salary}
                                onChange={(e) =>
                                    setFormData({ ...formData, salary: e.target.value })
                                }
                                isRequired
                            />

                            <Input
                                label="工作时间"
                                placeholder="例如：周末 9:00-18:00"
                                value={formData.worktime}
                                onChange={(e) =>
                                    setFormData({ ...formData, worktime: e.target.value })
                                }
                                isRequired
                            />

                            <div className="md:col-span-2">
                                <Input
                                    label="工作地点"
                                    placeholder="请输入详细工作地点"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    isRequired
                                />
                            </div>

                            <div className="md:col-span-2">
                                <ContactInput
                                    label="联系方式"
                                    value={formData.contact}
                                    onChange={(value) =>
                                        setFormData({ ...formData, contact: value })
                                    }
                                    isRequired
                                    description="支持手机号、微信号等多种格式"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <RequirementsInput
                                    label="招聘要求"
                                    value={formData.requirements}
                                    onChange={(value) =>
                                        setFormData({ ...formData, requirements: value })
                                    }
                                    description="选择性别要求并添加其他招聘条件"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Textarea
                                    label="职位描述"
                                    placeholder="请详细描述职位要求、工作内容等"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={4}
                                    isRequired
                                />
                            </div>
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
