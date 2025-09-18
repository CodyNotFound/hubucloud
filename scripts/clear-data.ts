#!/usr/bin/env bun
/**
 * 清理数据脚本 - 删除所有餐厅和兼职数据
 */

const API_BASE_URL = 'http://localhost:3002';

// JWT Token
const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZwNmpjcWcwMDAwM3N2Z21ocnJ4ZDR1IiwidXNlcm5hbWUiOiJjb2R5Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU4MTg2MTU5LCJleHAiOjE3NTg3OTA5NTksImF1ZCI6Imh1YnVjbG91ZC11c2VycyIsImlzcyI6Imh1YnVjbG91ZCJ9.49o8rp75iaOrrh7PLl2r0SkuNrjimTt6pTS3ZJQoiZ4';

async function clearAllData() {
    console.log('🧹 开始清理所有数据...');

    try {
        // 获取所有餐厅
        const restaurantsResponse = await fetch(`${API_BASE_URL}/api/restaurants?limit=100`, {
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        if (restaurantsResponse.ok) {
            const restaurantsResult = await restaurantsResponse.json();
            if (restaurantsResult.status === 'success') {
                const restaurants = restaurantsResult.data.restaurants;
                console.log(`📍 找到 ${restaurants.length} 个餐厅`);

                for (const restaurant of restaurants) {
                    const deleteResponse = await fetch(
                        `${API_BASE_URL}/api/admin/restaurant/${restaurant.id}`,
                        {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${JWT_TOKEN}`,
                            },
                        }
                    );

                    if (deleteResponse.ok) {
                        console.log(`✅ 删除餐厅: ${restaurant.name}`);
                    } else {
                        console.log(`❌ 删除餐厅失败: ${restaurant.name}`);
                    }
                }
            }
        }

        // 获取所有兼职
        const parttimesResponse = await fetch(`${API_BASE_URL}/api/parttime?limit=100`, {
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        if (parttimesResponse.ok) {
            const parttimesResult = await parttimesResponse.json();
            if (parttimesResult.status === 'success') {
                const parttimes = parttimesResult.data.parttimes;
                console.log(`💼 找到 ${parttimes.length} 个兼职`);

                for (const parttime of parttimes) {
                    const deleteResponse = await fetch(
                        `${API_BASE_URL}/api/admin/parttime/${parttime.id}`,
                        {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${JWT_TOKEN}`,
                            },
                        }
                    );

                    if (deleteResponse.ok) {
                        console.log(`✅ 删除兼职: ${parttime.name}`);
                    } else {
                        console.log(`❌ 删除兼职失败: ${parttime.name}`);
                    }
                }
            }
        }

        console.log('🎉 数据清理完成！');
    } catch (error) {
        console.error('❌ 清理数据失败:', error);
    }
}

if (import.meta.main) {
    clearAllData();
}
