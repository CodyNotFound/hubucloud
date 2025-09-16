#!/usr/bin/env bun
import { readFileSync } from 'fs';
import { join } from 'path';

// JWT token从登录获得
const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZsMTlxaW0wMDAwM3NmcTU1aDJzb2QyIiwidXNlcm5hbWUiOiJjb2R5Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3OTM1NTAyLCJleHAiOjE3NTg1NDAzMDIsImF1ZCI6Imh1YnVjbG91ZC11c2VycyIsImlzcyI6Imh1YnVjbG91ZCJ9.3ORYr6is_KZfC6fI36sVRfVNNPCY6ocnkH1DL3zV31Q';
const API_BASE_URL = 'http://localhost:8001';

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

interface RestaurantData {
    name: string;
    address: string;
    phone: string;
    description: string;
    type: string;
    cover: string;
    tags: string[];
    preview: string[];
    openTime: string;
    rating: number;
    latitude: number;
    longitude: number;
}

/**
 * 解析CSV文件
 */
function parseCSV(csvContent: string): CSVRestaurant[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());

    const restaurants: CSVRestaurant[] = [];

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
            const restaurant: any = {};
            headers.forEach((header, index) => {
                restaurant[header] = fields[index] ? fields[index].replace(/^"|"$/g, '') : '';
            });
            restaurants.push(restaurant as CSVRestaurant);
        }
    }

    return restaurants;
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

        console.log(`📝 解析JSON: ${str} -> ${cleanStr}`);

        const parsed = JSON.parse(cleanStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log(`⚠️  JSON解析失败: ${str}`, error);
        return [];
    }
}

/**
 * 上传图片文件
 */
async function uploadImage(imagePath: string): Promise<string | null> {
    try {
        // 处理路径：移除/api/upload前缀，转换为migration目录路径
        const cleanPath = imagePath.replace(/^\/api\/upload\//, '');
        const fullPath = join(process.cwd(), '..', 'migration', 'uploads', cleanPath);

        // 检查文件是否存在
        const file = Bun.file(fullPath);
        const exists = await file.exists();

        if (!exists) {
            console.log(`⚠️  图片文件不存在: ${fullPath}`);
            return null;
        }

        // 创建FormData
        const formData = new FormData();
        formData.append('image', file);

        // 上传图片
        const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log(`✅ 图片上传成功: ${imagePath} -> ${result.data.url}`);
            return result.data.url;
        } else {
            console.error(`❌ 图片上传失败: ${imagePath}`, result.message || result);
            return null;
        }
    } catch (error) {
        console.error(`❌ 图片上传网络错误: ${imagePath}`, error);
        return null;
    }
}

/**
 * 批量上传图片
 */
async function uploadImages(imagePaths: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const imagePath of imagePaths) {
        if (!imagePath || imagePath.trim() === '') continue;

        const url = await uploadImage(imagePath);
        if (url) {
            uploadedUrls.push(url);
        }

        // 避免请求过于频繁
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return uploadedUrls;
}

/**
 * 转换分类名称
 */
function transformCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
        campusfood: '校园美食',
        mainfood: '主食',
        drinks: '饮品',
        nightmarket: '夜宵',
        snacks: '小吃',
        dessert: '甜品',
        fastfood: '快餐',
    };

    return categoryMap[category.toLowerCase()] || '美食';
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
    const phone = csvRestaurant.phone || '';
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
    } else if (categoryLower === 'snacks') {
        tags.push('小吃', '零食');
    } else if (categoryLower === 'dessert') {
        tags.push('甜品', '蛋糕');
    } else if (categoryLower === 'fastfood') {
        tags.push('快餐', '汉堡');
    }

    // 去重标签
    tags = [...new Set(tags)].filter((tag) => tag && tag.trim());

    // 处理图片 - 上传封面图
    let cover = '/logo.png'; // 默认封面
    if (csvRestaurant.images) {
        const imagePaths = parseJSONArray(csvRestaurant.images);
        if (imagePaths.length > 0) {
            const uploadedCover = await uploadImage(imagePaths[0]);
            if (uploadedCover) {
                cover = uploadedCover;
            }
        }
    } else if (csvRestaurant.image) {
        // 处理单个图片字段
        const uploadedCover = await uploadImage(csvRestaurant.image);
        if (uploadedCover) {
            cover = uploadedCover;
        }
    }

    // 处理预览图片
    let preview: string[] = [];
    if (csvRestaurant.images) {
        const imagePaths = parseJSONArray(csvRestaurant.images);
        if (imagePaths.length > 1) {
            // 跳过第一张图片（作为封面），上传其余图片作为预览
            const previewPaths = imagePaths.slice(1);
            preview = await uploadImages(previewPaths);
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
 * 调用后端API创建餐厅
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
 * 主要迁移函数
 */
async function migrateRestaurantsFromCSV() {
    console.log('🚀 开始从CSV迁移餐厅数据到后端API...');

    try {
        // 读取CSV文件
        const csvPath = join(process.cwd(), '..', 'migration', 'restaurants.csv');
        console.log(`📂 读取CSV文件: ${csvPath}`);

        const csvContent = readFileSync(csvPath, 'utf-8');
        const csvRestaurants = parseCSV(csvContent);
        console.log(`📊 解析到 ${csvRestaurants.length} 条CSV记录`);

        // 获取现有餐厅，避免重复
        console.log('🔍 检查现有餐厅...');
        const existingNames = await getExistingRestaurants();
        console.log(`📋 已存在 ${existingNames.length} 个餐厅`);

        // 转换数据
        const restaurantData: RestaurantData[] = [];
        let skipped = 0;

        console.log('🔄 开始转换数据和上传图片...');
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
    } catch (error) {
        console.error('❌ 迁移过程中发生错误:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    migrateRestaurantsFromCSV().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}
