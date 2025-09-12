'use client';

import { useState, useMemo } from 'react';
import { Card, CardBody, Chip, Select, SelectItem, Pagination } from '@heroui/react';
import { MapPin, Clock, DollarSign, Users, Calendar } from 'lucide-react';

// 模拟兼职数据
const mockJobs = [
    {
        id: 1,
        title: '校园送餐员',
        company: '美团外卖',
        location: '湖北大学校内',
        salary: '15-25元/小时',
        type: '兼职',
        workTime: '灵活时间',
        description: '负责校内外卖配送，时间灵活，收入稳定',
        tags: ['配送', '灵活时间'],
        publishDate: '2025-01-10',
        applicants: 12,
    },
    {
        id: 2,
        title: '家教老师',
        company: '个人发布',
        location: '武汉市武昌区',
        salary: '80-120元/小时',
        type: '兼职',
        workTime: '周末',
        description: '高中数学家教，要求数学专业或理工科背景',
        tags: ['教育', '周末'],
        publishDate: '2025-01-09',
        applicants: 8,
    },
    {
        id: 3,
        title: '咖啡厅服务员',
        company: '星巴克',
        location: '光谷广场店',
        salary: '18-22元/小时',
        type: '兼职',
        workTime: '周末',
        description: '负责点单、制作饮品、店面清洁等工作',
        tags: ['服务', '周末'],
        publishDate: '2025-01-08',
        applicants: 25,
    },
    {
        id: 4,
        title: '活动助理',
        company: '湖大学生会',
        location: '湖北大学',
        salary: '100-150元/天',
        type: '临时工',
        workTime: '灵活时间',
        description: '协助组织校园活动，布置会场，维持秩序',
        tags: ['活动', '校内'],
        publishDate: '2025-01-07',
        applicants: 15,
    },
    {
        id: 5,
        title: '线上客服',
        company: '京东商城',
        location: '在线办公',
        salary: '16-20元/小时',
        type: '兼职',
        workTime: '灵活时间',
        description: '处理用户咨询，解答商品问题，需要良好沟通能力',
        tags: ['客服', '在线'],
        publishDate: '2025-01-06',
        applicants: 20,
    },
    {
        id: 6,
        title: '促销员',
        company: '小米之家',
        location: '群光广场店',
        salary: '120-180元/天',
        type: '兼职',
        workTime: '周末',
        description: '产品推广，销售协助，需要较强表达能力',
        tags: ['销售', '周末'],
        publishDate: '2025-01-05',
        applicants: 18,
    },
    {
        id: 7,
        title: '图书管理员',
        company: '湖大图书馆',
        location: '湖北大学图书馆',
        salary: '15元/小时',
        type: '兼职',
        workTime: '平日',
        description: '协助图书整理，读者服务，环境安静',
        tags: ['图书', '校内', '安静'],
        publishDate: '2025-01-04',
        applicants: 10,
    },
    {
        id: 8,
        title: '数据录入员',
        company: '科技公司',
        location: '在线办公',
        salary: '12-16元/小时',
        type: '兼职',
        workTime: '灵活时间',
        description: '负责数据录入和整理工作，要求细心认真',
        tags: ['数据', '在线', '细心'],
        publishDate: '2025-01-03',
        applicants: 30,
    },
    {
        id: 9,
        title: '摄影助理',
        company: '婚纱摄影工作室',
        location: '汉口江滩',
        salary: '200-300元/天',
        type: '兼职',
        workTime: '周末',
        description: '协助摄影师拍摄，布置场景，需要摄影基础',
        tags: ['摄影', '创意'],
        publishDate: '2025-01-02',
        applicants: 6,
    },
    {
        id: 10,
        title: '英语翻译',
        company: '翻译公司',
        location: '在线办公',
        salary: '30-50元/千字',
        type: '兼职',
        workTime: '灵活时间',
        description: '英文资料翻译，要求英语六级以上',
        tags: ['翻译', '英语', '在线'],
        publishDate: '2025-01-01',
        applicants: 14,
    },
    {
        id: 11,
        title: '快递分拣员',
        company: '顺丰速运',
        location: '武昌分拣中心',
        salary: '18-25元/小时',
        type: '兼职',
        workTime: '平日',
        description: '负责快递包裹分拣，体力要求较高',
        tags: ['物流', '体力'],
        publishDate: '2024-12-30',
        applicants: 22,
    },
    {
        id: 12,
        title: '社交媒体运营',
        company: '创业公司',
        location: '在线办公',
        salary: '1000-2000元/月',
        type: '实习',
        workTime: '灵活时间',
        description: '负责微博、微信等社交媒体内容运营',
        tags: ['运营', '创意', '在线'],
        publishDate: '2024-12-29',
        applicants: 35,
    },
];

const workTimeOptions = [
    { key: 'all', label: '全部时间' },
    { key: '灵活时间', label: '灵活时间' },
    { key: '周末', label: '周末' },
    { key: '平日', label: '平日' },
];

const jobTypeOptions = [
    { key: 'all', label: '全部类型' },
    { key: '兼职', label: '兼职' },
    { key: '实习', label: '实习' },
    { key: '临时工', label: '临时工' },
];

const salaryRangeOptions = [
    { key: 'all', label: '全部薪资' },
    { key: 'low', label: '15元/时以下' },
    { key: 'medium', label: '15-25元/时' },
    { key: 'high', label: '25元/时以上' },
];

export default function JobsPage() {
    const [selectedJobType, setSelectedJobType] = useState<string>('all');
    const [selectedWorkTime, setSelectedWorkTime] = useState<string>('all');
    const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 6;

    // 筛选逻辑
    const filteredJobs = useMemo(() => {
        return mockJobs.filter((job) => {
            // 工作类型筛选
            if (selectedJobType !== 'all' && job.type !== selectedJobType) {
                return false;
            }

            // 工作时间筛选
            if (selectedWorkTime !== 'all' && job.workTime !== selectedWorkTime) {
                return false;
            }

            // 薪资范围筛选
            if (selectedSalaryRange !== 'all') {
                const hourlyMatch = job.salary.match(/(\d+)-(\d+)元\/小时/);
                if (hourlyMatch) {
                    const avgHourly = (parseInt(hourlyMatch[1]) + parseInt(hourlyMatch[2])) / 2;

                    if (selectedSalaryRange === 'low' && avgHourly >= 15) return false;
                    if (selectedSalaryRange === 'medium' && (avgHourly < 15 || avgHourly > 25))
                        return false;
                    if (selectedSalaryRange === 'high' && avgHourly <= 25) return false;
                }
            }

            return true;
        });
    }, [selectedJobType, selectedWorkTime, selectedSalaryRange]);

    // 分页逻辑
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredJobs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredJobs, currentPage]);

    // 当筛选条件变化时，重置到第一页
    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentPage(1);

        if (filterType === 'jobType') {
            setSelectedJobType(value);
        } else if (filterType === 'workTime') {
            setSelectedWorkTime(value);
        } else if (filterType === 'salaryRange') {
            setSelectedSalaryRange(value);
        }
    };

    return (
        <>
            {/* 页面标题区 */}
            <section className="w-full py-2">
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">校园兼职</h2>
                    <p className="text-sm text-default-600">找到适合你的兼职工作</p>
                </div>

                {/* 筛选区域 */}
                <div className="space-y-2 mb-4">
                    <Select
                        placeholder="工作类型"
                        selectedKeys={selectedJobType ? [selectedJobType] : []}
                        onSelectionChange={(keys) =>
                            handleFilterChange('jobType', Array.from(keys)[0] as string)
                        }
                        className="w-full"
                        size="sm"
                    >
                        {jobTypeOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                    </Select>

                    <Select
                        placeholder="工作时间"
                        selectedKeys={selectedWorkTime ? [selectedWorkTime] : []}
                        onSelectionChange={(keys) =>
                            handleFilterChange('workTime', Array.from(keys)[0] as string)
                        }
                        className="w-full"
                        size="sm"
                    >
                        {workTimeOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                    </Select>

                    <Select
                        placeholder="薪资范围"
                        selectedKeys={selectedSalaryRange ? [selectedSalaryRange] : []}
                        onSelectionChange={(keys) =>
                            handleFilterChange('salaryRange', Array.from(keys)[0] as string)
                        }
                        className="w-full"
                        size="sm"
                    >
                        {salaryRangeOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                    </Select>
                </div>

                {/* 结果统计 */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-default-600">
                        共找到{' '}
                        <span className="font-semibold text-primary">{filteredJobs.length}</span>{' '}
                        个职位
                    </p>
                    <p className="text-xs text-default-500">
                        第 {currentPage} 页，共 {totalPages} 页
                    </p>
                </div>
            </section>

            {/* 兼职列表 */}
            <section className="w-full py-2">
                <div className="space-y-3">
                    {paginatedJobs.map((job) => (
                        <Card key={job.id} className="w-full hover:shadow-md transition-shadow">
                            <CardBody className="p-4">
                                {/* 职位标题和公司 */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-default-600">{job.company}</p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        color={
                                            job.type === '兼职'
                                                ? 'primary'
                                                : job.type === '实习'
                                                  ? 'secondary'
                                                  : 'success'
                                        }
                                        variant="flat"
                                    >
                                        {job.type}
                                    </Chip>
                                </div>

                                {/* 薪资信息 */}
                                <div className="flex items-center gap-1 mb-3">
                                    <DollarSign className="w-4 h-4 text-success" />
                                    <span className="text-success font-semibold">{job.salary}</span>
                                </div>

                                {/* 工作信息 */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center gap-2 text-sm text-default-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="line-clamp-1">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-default-600">
                                        <Clock className="w-4 h-4" />
                                        <span>{job.workTime}</span>
                                    </div>
                                </div>

                                {/* 职位描述 */}
                                <p className="text-sm text-default-700 mb-3 line-clamp-2">
                                    {job.description}
                                </p>

                                {/* 标签 */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {job.tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            size="sm"
                                            variant="bordered"
                                            className="text-xs"
                                        >
                                            {tag}
                                        </Chip>
                                    ))}
                                </div>

                                {/* 底部信息 */}
                                <div className="flex items-center justify-between pt-2 border-t border-default-200">
                                    <div className="flex items-center gap-4 text-xs text-default-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{job.publishDate}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{job.applicants}人已申请</span>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* 分页器 */}
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

                {/* 无结果状态 */}
                {filteredJobs.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-default-500">没有找到符合条件的兼职职位</p>
                        <p className="text-sm text-default-400 mt-1">尝试调整筛选条件</p>
                    </div>
                )}
            </section>
        </>
    );
}
