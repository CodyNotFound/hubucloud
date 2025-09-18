#!/usr/bin/env bun
/**
 * 统一迁移脚本 - 将数据从CSV迁移到新的Next.js后端
 * 包含图片迁移和数据迁移功能
 */

import { readFileSync, existsSync, cpSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// 新后端API配置 (Next.js)
const API_BASE_URL = 'http://localhost:3002';

// 需要先登录获取JWT token
let JWT_TOKEN = '';

interface CSVRestaurant {
    id: string;
    address: string;
    avg_price: string;
    business_hours: string;
    category: string;
    create_time: string;
    delivery_fee: string;
    delivery_time: string;
    description: string;
    distance: string;
    full_description: string;
    image: string;
    is_open: string;
    is_recommended: string;
    menu_images: string;
    min_order: string;
    monthly_sales: string;
    name: string;
    open_hours: string;
    phone: string;
    rating: string;
    status: string;
    tags: string;
    update_time: string;
    average_price: string;
    black_card_benefits: string;
    images: string;
    location: string;
    opening_hours: string;
    review_count: string;
}

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

interface RestaurantData {
    name: string;
    address: string;
    phone: string | null;
    description: string;
    type: 'campusfood' | 'mainfood' | 'drinks' | 'nightmarket';
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    latitude: number;
    longitude: number;
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
}

/**
 * 用户认证，获取JWT Token
 */
async function authenticate(): Promise<boolean> {
    console.log('🔑 正在进行用户认证...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: 'cody',
                password: 'cody123', // 请修改为实际密码
            }),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            JWT_TOKEN = result.data.token;
            console.log('✅ 认证成功');
            return true;
        } else {
            console.error('❌ 认证失败:', result.message || result);
            return false;
        }
    } catch (error) {
        console.error('❌ 认证网络错误:', error);
        return false;
    }
}

/**
 * 解析CSV文件
 */
function parseCSV(csvContent: string): any[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());

    const records: any[] = [];

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
            const record: any = {};
            headers.forEach((header, index) => {
                record[header] = fields[index] ? fields[index].replace(/^"|"$/g, '') : '';
            });
            records.push(record);
        }
    }

    return records;
}

/**
 * 解析JSON数组字符串
 */
function parseJSONArray(str: string): string[] {
    try {
        if (!str || str.trim() === '[]' || str.trim() === '') return [];

        // 清理字符串，修复双引号问题
        let cleanStr = str.trim();

        // 移除外层引号（如果存在）
        if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
            cleanStr = cleanStr.slice(1, -1);
        }

        // 检查是否是标准JSON格式
        if (cleanStr.startsWith('[') && cleanStr.endsWith(']')) {
            // 处理无引号的数组 [item1,item2] -> ["item1","item2"]
            if (!cleanStr.includes('"')) {
                // 移除方括号
                const content = cleanStr.slice(1, -1);
                if (content.trim()) {
                    // 分割并添加引号
                    const items = content
                        .split(',')
                        .map((item) => item.trim())
                        .filter((item) => item);
                    cleanStr = '["' + items.join('","') + '"]';
                }
            } else {
                // 修复双引号问题 [""/path""] -> ["/path"]
                cleanStr = cleanStr.replace(/\[""/g, '["').replace(/""\]/g, '"]');
                // 修复中间的双引号 "",""path"",""  -> ","path",
                cleanStr = cleanStr.replace(/""([^"]*)""/g, '"$1"');
            }
        }

        const parsed = JSON.parse(cleanStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log(`⚠️  JSON解析失败: ${str}`, error);
        return [];
    }
}

/**
 * 复制图片文件到新后端public目录
 */
async function copyImageToPublic(imagePath: string): Promise<string | null> {
    try {
        // 处理路径：移除/api/upload前缀，转换为migration目录路径
        const cleanPath = imagePath.replace(/^\/api\/upload\//, '');
        const sourcePath = join(process.cwd(), 'migration', 'uploads', cleanPath);

        // 检查源文件是否存在
        if (!existsSync(sourcePath)) {
            console.log(`⚠️  源图片文件不存在: ${sourcePath}`);
            return null;
        }

        // 生成新的文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const ext = cleanPath.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = `restaurant_${timestamp}_${randomString}.webp`;

        // 目标路径
        const targetDir = join(process.cwd(), 'public', 'uploads', 'images');
        const targetPath = join(targetDir, newFileName);

        // 确保目标目录存在
        if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true });
        }

        // 使用Sharp压缩和转换图片
        const buffer = await sharp(sourcePath)
            .resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toBuffer();

        await Bun.write(targetPath, buffer);

        const imageUrl = `/uploads/images/${newFileName}`;
        console.log(`✅ 图片复制成功: ${imagePath} -> ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.error(`❌ 图片复制失败: ${imagePath}`, error);
        return null;
    }
}

/**
 * 批量复制图片
 */
async function copyImages(imagePaths: string[]): Promise<string[]> {
    const copiedUrls: string[] = [];

    for (const imagePath of imagePaths) {
        if (!imagePath || imagePath.trim() === '') continue;

        const url = await copyImageToPublic(imagePath);
        if (url) {
            copiedUrls.push(url);
        }

        // 避免处理过于频繁
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return copiedUrls;
}

/**
 * 转换分类名称
 */
function transformCategory(category: string): 'campusfood' | 'mainfood' | 'drinks' | 'nightmarket' {
    const categoryMap: { [key: string]: 'campusfood' | 'mainfood' | 'drinks' | 'nightmarket' } = {
        campusfood: 'campusfood',
        mainfood: 'mainfood',
        drinks: 'drinks',
        nightmarket: 'nightmarket',
        snacks: 'mainfood',
        dessert: 'drinks',
        fastfood: 'mainfood',
    };

    return categoryMap[category?.toLowerCase()] || 'mainfood';
}

/**
 * 转换CSV数据到餐厅API格式
 */
async function transformRestaurant(csvRestaurant: CSVRestaurant): Promise<RestaurantData | null> {
    // 跳过空的或无效的记录
    if (!csvRestaurant.name || !csvRestaurant.location) {
        console.log(`跳过无效记录: ${csvRestaurant.id} - 缺少必要字段`);
        return null;
    }

    // 处理基本信息
    const name = csvRestaurant.name.trim();
    const address = csvRestaurant.address || csvRestaurant.location || '地址未知';
    const phone = csvRestaurant.phone?.trim() || null; // 电话可选
    const description =
        csvRestaurant.description ||
        csvRestaurant.full_description ||
        `欢迎来到${name}，品尝美味佳肴。`;

    // 处理类型
    const type = transformCategory(csvRestaurant.category);

    // 处理评分 (1-5分)
    let rating = 5; // 默认评分
    if (csvRestaurant.rating) {
        const parsedRating = parseInt(csvRestaurant.rating);
        if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
            rating = parsedRating;
        }
    }

    // 处理营业时间
    let openTime =
        csvRestaurant.opening_hours ||
        csvRestaurant.open_hours ||
        csvRestaurant.business_hours ||
        '营业时间请咨询';

    // 处理标签
    let tags: string[] = [];
    if (csvRestaurant.tags) {
        tags = parseJSONArray(csvRestaurant.tags);
    }

    // 根据分类添加标签
    const categoryLower = csvRestaurant.category?.toLowerCase();
    if (categoryLower === 'drinks') {
        tags.push('饮品', '奶茶', '果汁');
    } else if (categoryLower === 'mainfood') {
        tags.push('正餐', '主食', '米饭');
    } else if (categoryLower === 'campusfood') {
        tags.push('校园', '学生餐', '食堂');
    } else if (categoryLower === 'nightmarket') {
        tags.push('夜宵', '烧烤', '宵夜');
    }

    // 去重标签
    tags = [...new Set(tags)].filter((tag) => tag && tag.trim());

    // 处理图片 - 复制封面图
    let cover = '/logo.png'; // 默认封面
    if (csvRestaurant.images) {
        const imagePaths = parseJSONArray(csvRestaurant.images);
        if (imagePaths.length > 0) {
            const copiedCover = await copyImageToPublic(imagePaths[0]);
            if (copiedCover) {
                cover = copiedCover;
            }
        }
    } else if (csvRestaurant.image) {
        // 处理单个图片字段
        const copiedCover = await copyImageToPublic(csvRestaurant.image);
        if (copiedCover) {
            cover = copiedCover;
        }
    }

    // 处理预览图片
    let preview: string[] = [];
    if (csvRestaurant.images) {
        const imagePaths = parseJSONArray(csvRestaurant.images);
        if (imagePaths.length > 1) {
            // 跳过第一张图片（作为封面），复制其余图片作为预览
            const previewPaths = imagePaths.slice(1);
            preview = await copyImages(previewPaths);
        }
    }

    // 处理地理坐标 (默认湖北大学坐标)
    const latitude = 30.5951;
    const longitude = 114.4086;

    return {
        name,
        address,
        phone,
        description,
        type,
        cover,
        tags,
        preview,
        openTime,
        rating,
        latitude,
        longitude,
    };
}

/**
 * 转换兼职数据
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

    // 处理类型
    let type = '校园兼职'; // 默认类型

    // 根据分类确定类型
    if (csvJob.category) {
        const category = csvJob.category.toLowerCase();
        if (category === 'campus') {
            type = '校园兼职';
        } else if (category === 'restaurant') {
            type = '餐饮服务';
        } else if (category === 'retail') {
            type = '零售销售';
        }
    }

    // 从商家名称推断类型
    if (csvJob.merchant_name) {
        const merchantName = csvJob.merchant_name.toLowerCase();
        if (merchantName.includes('奶茶') || merchantName.includes('饮品')) {
            type = '餐饮服务';
        } else if (merchantName.includes('烧烤') || merchantName.includes('烤')) {
            type = '餐饮服务';
        } else if (merchantName.includes('火锅') || merchantName.includes('麻辣')) {
            type = '餐饮服务';
        } else if (merchantName.includes('饺子') || merchantName.includes('面')) {
            type = '餐饮服务';
        } else if (merchantName.includes('台球') || merchantName.includes('棋牌')) {
            type = '娱乐服务';
        }
    }

    // 从标题推断类型
    if (name.includes('送餐') || name.includes('外卖')) {
        type = '外卖配送';
    }
    if (name.includes('服务员') || name.includes('店内')) {
        type = '餐饮服务';
    }

    return {
        name,
        type,
        salary,
        worktime,
        location,
        description,
        contact,
        requirements,
    };
}

/**
 * 调用新后端API创建餐厅
 */
async function createRestaurant(data: RestaurantData): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log(`✅ 成功创建餐厅: ${data.name}`);
            return true;
        } else {
            console.error(`❌ 创建餐厅失败: ${data.name}`, result.message || result);
            return false;
        }
    } catch (error) {
        console.error(`❌ 网络错误 - 创建餐厅失败: ${data.name}`, error);
        return false;
    }
}

/**
 * 调用新后端API创建兼职
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
 * 获取现有餐厅列表，避免重复
 */
async function getExistingRestaurants(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/restaurants?limit=100`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            return result.data.restaurants.map((r: any) => r.name);
        }
    } catch (error) {
        console.error('获取现有餐厅列表失败:', error);
    }

    return [];
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
 * 迁移餐厅数据
 */
async function migrateRestaurants() {
    console.log('\n🍽️  开始迁移餐厅数据...');

    try {
        // 读取CSV文件
        const csvPath = join(process.cwd(), 'migration', 'restaurants.csv');
        console.log(`📂 读取CSV文件: ${csvPath}`);

        const csvContent = readFileSync(csvPath, 'utf-8');
        const csvRestaurants = parseCSV(csvContent) as CSVRestaurant[];
        console.log(`📊 解析到 ${csvRestaurants.length} 条CSV记录`);

        // 获取现有餐厅，避免重复
        console.log('🔍 检查现有餐厅...');
        const existingNames = await getExistingRestaurants();
        console.log(`📋 已存在 ${existingNames.length} 个餐厅`);

        // 转换数据
        const restaurantData: RestaurantData[] = [];
        let skipped = 0;

        console.log('🔄 开始转换数据和复制图片...');
        for (let i = 0; i < csvRestaurants.length; i++) {
            const csvRestaurant = csvRestaurants[i];
            console.log(`\n[${i + 1}/${csvRestaurants.length}] 处理餐厅: ${csvRestaurant.name}`);

            const transformed = await transformRestaurant(csvRestaurant);
            if (transformed) {
                // 检查是否已存在
                if (existingNames.includes(transformed.name)) {
                    console.log(`⏭️  跳过重复餐厅: ${transformed.name}`);
                    skipped++;
                    continue;
                }
                restaurantData.push(transformed);
            } else {
                skipped++;
            }
        }

        console.log(`\n✨ 成功转换 ${restaurantData.length} 条记录，跳过 ${skipped} 条`);

        // 批量创建餐厅
        let created = 0;
        let failed = 0;

        console.log('📤 开始批量创建餐厅...');
        for (let i = 0; i < restaurantData.length; i++) {
            const data = restaurantData[i];
            console.log(`\n[${i + 1}/${restaurantData.length}] 创建餐厅: ${data.name}`);

            const success = await createRestaurant(data);
            if (success) {
                created++;
            } else {
                failed++;
            }

            // 每5个请求后稍作休息，避免过于频繁
            if (i % 5 === 0 && i > 0) {
                console.log('⏸️  暂停2秒...');
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        console.log('\n🎉 餐厅数据迁移完成！');
        console.log(`📊 统计结果:`);
        console.log(`  - CSV记录总数: ${csvRestaurants.length}`);
        console.log(`  - 有效记录数: ${restaurantData.length + skipped}`);
        console.log(`  - 跳过记录数: ${skipped}`);
        console.log(`  - 成功创建数: ${created}`);
        console.log(`  - 创建失败数: ${failed}`);

        return { total: csvRestaurants.length, created, failed, skipped };
    } catch (error) {
        console.error('❌ 餐厅迁移过程中发生错误:', error);
        throw error;
    }
}

/**
 * 迁移兼职数据
 */
async function migrateParttimes() {
    console.log('\n💼 开始迁移兼职数据...');

    try {
        // 读取CSV文件
        const csvPath = join(process.cwd(), 'migration', 'jobs.csv');
        console.log(`📂 读取CSV文件: ${csvPath}`);

        const csvContent = readFileSync(csvPath, 'utf-8');
        const csvJobs = parseCSV(csvContent) as CSVJob[];
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

        console.log('\n🎉 兼职数据迁移完成！');
        console.log(`📊 统计结果:`);
        console.log(`  - CSV记录总数: ${csvJobs.length}`);
        console.log(`  - 有效记录数: ${parttimeData.length + skipped}`);
        console.log(`  - 跳过记录数: ${skipped}`);
        console.log(`  - 成功创建数: ${created}`);
        console.log(`  - 创建失败数: ${failed}`);

        return { total: csvJobs.length, created, failed, skipped };
    } catch (error) {
        console.error('❌ 兼职迁移过程中发生错误:', error);
        throw error;
    }
}

/**
 * 主迁移函数
 */
async function main() {
    console.log('🚀 开始数据迁移到新的Next.js后端...');
    console.log(`🎯 目标API: ${API_BASE_URL}`);

    try {
        // 1. 用户认证
        const authSuccess = await authenticate();
        if (!authSuccess) {
            console.error('❌ 认证失败，请检查用户名和密码');
            process.exit(1);
        }

        // 2. 迁移餐厅数据
        const restaurantResult = await migrateRestaurants();

        // 3. 迁移兼职数据
        const parttimeResult = await migrateParttimes();

        // 4. 总结
        console.log('\n🎊 所有数据迁移完成！');
        console.log(`📈 迁移总结:`);
        console.log(`  餐厅数据:`);
        console.log(`    - 总记录: ${restaurantResult.total}`);
        console.log(`    - 成功创建: ${restaurantResult.created}`);
        console.log(`    - 创建失败: ${restaurantResult.failed}`);
        console.log(`    - 跳过重复: ${restaurantResult.skipped}`);
        console.log(`  兼职数据:`);
        console.log(`    - 总记录: ${parttimeResult.total}`);
        console.log(`    - 成功创建: ${parttimeResult.created}`);
        console.log(`    - 创建失败: ${parttimeResult.failed}`);
        console.log(`    - 跳过重复: ${parttimeResult.skipped}`);
    } catch (error) {
        console.error('❌ 迁移过程中发生严重错误:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    main().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}
