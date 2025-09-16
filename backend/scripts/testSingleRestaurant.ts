#!/usr/bin/env bun
import { readFileSync } from 'fs';
import { join } from 'path';

// JWT token
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

function parseCSV(csvContent: string): CSVRestaurant[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());

    const restaurants: CSVRestaurant[] = [];

    for (let i = 1; i < Math.min(3, lines.length); i++) {
        // 只处理前2个
        const line = lines[i].trim();
        if (!line) continue;

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
        fields.push(current.trim());

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

function parseJSONArray(str: string): string[] {
    try {
        if (!str || str.trim() === '[]' || str.trim() === '') return [];

        let cleanStr = str.trim();

        if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) {
            cleanStr = cleanStr.slice(1, -1);
        }

        if (cleanStr.startsWith('[') && cleanStr.endsWith(']')) {
            if (!cleanStr.includes('"')) {
                const content = cleanStr.slice(1, -1);
                if (content.trim()) {
                    const items = content
                        .split(',')
                        .map((item) => item.trim())
                        .filter((item) => item);
                    cleanStr = '["' + items.join('","') + '"]';
                }
            } else {
                cleanStr = cleanStr.replace(/\[""/g, '["').replace(/""\]/g, '"]');
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

async function uploadImage(imagePath: string): Promise<string | null> {
    try {
        const cleanPath = imagePath.replace(/^\/api\/upload\//, '');
        const fullPath = join(process.cwd(), '..', 'migration', 'uploads', cleanPath);

        console.log(`🔍 检查图片文件: ${fullPath}`);

        const file = Bun.file(fullPath);
        const exists = await file.exists();

        if (!exists) {
            console.log(`⚠️  图片文件不存在: ${fullPath}`);
            return null;
        }

        console.log(`📤 开始上传图片: ${imagePath}`);

        const formData = new FormData();
        formData.append('image', file);

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

async function testSingleRestaurant() {
    console.log('🧪 开始测试单个餐厅的图片处理...\n');

    try {
        const csvPath = join(process.cwd(), '..', 'migration', 'restaurants.csv');
        const csvContent = readFileSync(csvPath, 'utf-8');
        const csvRestaurants = parseCSV(csvContent);

        console.log(`📊 解析到 ${csvRestaurants.length} 条测试记录\n`);

        for (let i = 0; i < csvRestaurants.length; i++) {
            const restaurant = csvRestaurants[i];
            console.log(`\n[${i + 1}] 处理餐厅: ${restaurant.name}`);
            console.log(`   分类: ${restaurant.category}`);
            console.log(`   标签字段: ${restaurant.tags}`);
            console.log(`   图片字段: ${restaurant.images}`);

            // 解析标签
            if (restaurant.tags) {
                const tags = parseJSONArray(restaurant.tags);
                console.log(`   解析的标签:`, tags);
            }

            // 解析图片
            if (restaurant.images) {
                const imagePaths = parseJSONArray(restaurant.images);
                console.log(`   解析的图片:`, imagePaths);

                if (imagePaths.length > 0) {
                    console.log(`   尝试上传封面图片: ${imagePaths[0]}`);
                    const uploadedUrl = await uploadImage(imagePaths[0]);
                    console.log(`   上传结果: ${uploadedUrl || 'Failed'}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

if (import.meta.main) {
    testSingleRestaurant();
}
