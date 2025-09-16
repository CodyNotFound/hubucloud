#!/usr/bin/env bun
import { readFileSync } from 'fs';
import { join } from 'path';

// JWT token从登录获得
const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZsMTlxaW0wMDAwM3NmcTU1aDJzb2QyIiwidXNlcm5hbWUiOiJjb2R5Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3OTM1NTAyLCJleHAiOjE3NTg1NDAzMDIsImF1ZCI6Imh1YnVjbG91ZC11c2VycyIsImlzcyI6Imh1YnVjbG91ZCJ9.3ORYr6is_KZfC6fI36sVRfVNNPCY6ocnkH1DL3zV31Q';
const API_BASE_URL = 'http://localhost:8001';

interface CSVJob {
    id: string;
    benefits: string;
    category: string;
    company_logo: string;
    contact_info: string;
    current_applicants: string;
    deadline: string;
    description: string;
    is_urgent: string;
    max_applicants: string;
    merchant_desc: string;
    merchant_id: string;
    merchant_name: string;
    publish_time: string;
    publisher_id: string;
    requirements: string;
    salary: string;
    status: string;
    tags: string;
    title: string;
    work_location: string;
    work_time: string;
}

interface ParttimeData {
    name: string;
    type: string;
    salary: string;
    worktime: string;
    location: string;
    description: string;
    contact: string;
    requirements?: string;
    tags: string[];
}

/**
 * 解析CSV文件
 */
function parseCSV(csvContent: string): CSVJob[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());

    const jobs: CSVJob[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 简单的CSV解析 - 处理引号包裹的字段
        const fields: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim()); // 添加最后一个字段

        if (fields.length >= headers.length) {
            const job: any = {};
            headers.forEach((header, index) => {
                job[header] = fields[index] || '';
            });
            jobs.push(job as CSVJob);
        }
    }

    return jobs;
}

/**
 * 转换CSV数据到后端API格式
 */
function transformJobToParttime(csvJob: CSVJob): ParttimeData | null {
    // 跳过空的或无效的记录
    if (!csvJob.title || !csvJob.contact_info || !csvJob.work_location) {
        console.log(`跳过无效记录: ${csvJob.id} - 缺少必要字段`);
        return null;
    }

    // 处理标题和描述
    const name = csvJob.title.trim();
    let description = '';

    if (csvJob.description && csvJob.description.trim()) {
        description = csvJob.description.trim();
    } else if (csvJob.merchant_desc && csvJob.merchant_desc.trim()) {
        description = csvJob.merchant_desc.trim();
    } else {
        description = `${csvJob.merchant_name || '商家'}招聘兼职，欢迎咨询详细信息。`;
    }

    // 处理薪资
    let salary = csvJob.salary && csvJob.salary.trim() ? csvJob.salary.trim() : '面议';

    // 处理工作时间
    let worktime =
        csvJob.work_time && csvJob.work_time.trim() ? csvJob.work_time.trim() : '时间面议';

    // 处理工作地点
    const location = csvJob.work_location.trim();

    // 处理联系方式
    let contact = csvJob.contact_info.trim();
    if (!contact) {
        console.log(`跳过无联系方式的记录: ${csvJob.id}`);
        return null;
    }

    // 处理要求
    let requirements =
        csvJob.requirements && csvJob.requirements.trim() ? csvJob.requirements.trim() : undefined;

    // 处理类型和标签
    let type = '校园兼职'; // 默认类型
    let tags: string[] = [];

    // 根据分类确定类型和添加标签
    if (csvJob.category) {
        const category = csvJob.category.toLowerCase();
        if (category === 'campus') {
            type = '校园兼职';
            tags.push('校园');
        } else if (category === 'restaurant') {
            type = '餐饮服务';
            tags.push('餐饮');
        } else if (category === 'retail') {
            type = '零售销售';
            tags.push('零售');
        }
    }

    // 从商家名称推断标签
    if (csvJob.merchant_name) {
        const merchantName = csvJob.merchant_name.toLowerCase();
        if (merchantName.includes('奶茶') || merchantName.includes('饮品')) {
            tags.push('奶茶', '饮品');
        } else if (merchantName.includes('烧烤') || merchantName.includes('烤')) {
            tags.push('烧烤', '餐饮');
        } else if (merchantName.includes('火锅') || merchantName.includes('麻辣')) {
            tags.push('火锅', '餐饮');
        } else if (merchantName.includes('饺子') || merchantName.includes('面')) {
            tags.push('面食', '餐饮');
        } else if (merchantName.includes('台球') || merchantName.includes('棋牌')) {
            tags.push('娱乐', '台球');
        }
    }

    // 从标题推断标签
    if (name.includes('送餐') || name.includes('外卖')) {
        tags.push('送餐', '外卖');
    }
    if (name.includes('服务员') || name.includes('店内')) {
        tags.push('服务员');
    }
    if (name.includes('女生') || name.includes('女')) {
        tags.push('女生');
    }
    if (name.includes('男生') || name.includes('男')) {
        tags.push('男生');
    }

    // 默认标签
    if (tags.length === 0) {
        tags.push('兼职', '校园');
    }

    // 去重
    tags = [...new Set(tags)];

    return {
        name,
        type,
        salary,
        worktime,
        location,
        description,
        contact,
        requirements,
        tags,
    };
}

/**
 * 调用后端API创建兼职
 */
async function createParttime(data: ParttimeData): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/parttime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log(`✅ 成功创建兼职: ${data.name}`);
            return true;
        } else {
            console.error(`❌ 创建兼职失败: ${data.name}`, result.message || result);
            return false;
        }
    } catch (error) {
        console.error(`❌ 网络错误 - 创建兼职失败: ${data.name}`, error);
        return false;
    }
}

/**
 * 获取现有兼职列表，避免重复
 */
async function getExistingParttimes(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/parttime?limit=100`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            return result.data.parttimes.map((p: any) => p.name);
        }
    } catch (error) {
        console.error('获取现有兼职列表失败:', error);
    }

    return [];
}

/**
 * 主要迁移函数
 */
async function migrateJobsFromCSV() {
    console.log('🚀 开始从CSV迁移jobs数据到后端API...');

    try {
        // 读取CSV文件
        const csvPath = join(process.cwd(), '..', 'migration', 'jobs.csv');
        console.log(`📂 读取CSV文件: ${csvPath}`);

        const csvContent = readFileSync(csvPath, 'utf-8');
        const csvJobs = parseCSV(csvContent);
        console.log(`📊 解析到 ${csvJobs.length} 条CSV记录`);

        // 获取现有兼职，避免重复
        console.log('🔍 检查现有兼职...');
        const existingNames = await getExistingParttimes();
        console.log(`📋 已存在 ${existingNames.length} 个兼职`);

        // 转换数据
        const parttimeData: ParttimeData[] = [];
        let skipped = 0;

        for (const csvJob of csvJobs) {
            const transformed = transformJobToParttime(csvJob);
            if (transformed) {
                // 检查是否已存在
                if (existingNames.includes(transformed.name)) {
                    console.log(`⏭️  跳过重复兼职: ${transformed.name}`);
                    skipped++;
                    continue;
                }
                parttimeData.push(transformed);
            } else {
                skipped++;
            }
        }

        console.log(`✨ 成功转换 ${parttimeData.length} 条记录，跳过 ${skipped} 条`);

        // 批量创建兼职
        let created = 0;
        let failed = 0;

        console.log('📤 开始批量创建兼职...');
        for (let i = 0; i < parttimeData.length; i++) {
            const data = parttimeData[i];
            console.log(`\n[${i + 1}/${parttimeData.length}] 处理: ${data.name}`);

            const success = await createParttime(data);
            if (success) {
                created++;
            } else {
                failed++;
            }

            // 每10个请求后稍作休息，避免过于频繁
            if (i % 10 === 0 && i > 0) {
                console.log('⏸️  暂停1秒...');
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        console.log('\n🎉 迁移完成！');
        console.log(`📊 统计结果:`);
        console.log(`  - CSV记录总数: ${csvJobs.length}`);
        console.log(`  - 有效记录数: ${parttimeData.length + skipped}`);
        console.log(`  - 跳过记录数: ${skipped}`);
        console.log(`  - 成功创建数: ${created}`);
        console.log(`  - 创建失败数: ${failed}`);
    } catch (error) {
        console.error('❌ 迁移过程中发生错误:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    migrateJobsFromCSV().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}
