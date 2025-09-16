#!/usr/bin/env bun

// JWT token从登录获得
const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZsMTlxaW0wMDAwM3NmcTU1aDJzb2QyIiwidXNlcm5hbWUiOiJjb2R5Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU3OTM1NTAyLCJleHAiOjE3NTg1NDAzMDIsImF1ZCI6Imh1YnVjbG91ZC11c2VycyIsImlzcyI6Imh1YnVjbG91ZCJ9.3ORYr6is_KZfC6fI36sVRfVNNPCY6ocnkH1DL3zV31Q';
const API_BASE_URL = 'http://localhost:8001';

/**
 * 获取所有餐厅
 */
async function getAllRestaurants(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/restaurants?limit=100`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        const result = await response.json();
        if (response.ok && result.status === 'success') {
            return result.data.restaurants;
        }
    } catch (error) {
        console.error('获取餐厅列表失败:', error);
    }
    return [];
}

/**
 * 删除餐厅
 */
async function deleteRestaurant(id: string, name: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/restaurants/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        const result = await response.json();
        if (response.ok && result.status === 'success') {
            console.log(`✅ 删除餐厅: ${name}`);
            return true;
        } else {
            console.error(`❌ 删除餐厅失败: ${name}`, result.message || result);
            return false;
        }
    } catch (error) {
        console.error(`❌ 网络错误 - 删除餐厅失败: ${name}`, error);
        return false;
    }
}

/**
 * 清理所有餐厅数据
 */
async function clearAllRestaurants() {
    console.log('🚀 开始清理所有餐厅数据...');

    try {
        const restaurants = await getAllRestaurants();
        console.log(`📋 找到 ${restaurants.length} 个餐厅需要删除`);

        let deletedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            console.log(`\n[${i + 1}/${restaurants.length}] 删除: ${restaurant.name}`);

            const success = await deleteRestaurant(restaurant.id, restaurant.name);
            if (success) {
                deletedCount++;
            } else {
                failedCount++;
            }

            // 避免请求过于频繁
            if (i % 10 === 0 && i > 0) {
                console.log('⏸️  暂停1秒...');
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        console.log('\n🎉 清理完成！');
        console.log(`📊 统计结果:`);
        console.log(`  - 总餐厅数: ${restaurants.length}`);
        console.log(`  - 成功删除: ${deletedCount}`);
        console.log(`  - 删除失败: ${failedCount}`);
    } catch (error) {
        console.error('❌ 清理过程中发生错误:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    clearAllRestaurants().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}
