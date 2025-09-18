#!/usr/bin/env bun
/**
 * 测试餐厅创建，验证phone字段可选性
 */

const API_BASE_URL = 'http://localhost:3002';

// JWT Token (需要从认证获取)
async function getAuthToken(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user: 'cody',
            password: 'cody123',
        }),
    });

    const result = await response.json();
    if (response.ok && result.status === 'success') {
        return result.data.token;
    }
    throw new Error('认证失败');
}

async function testRestaurantCreation() {
    console.log('🧪 测试餐厅创建（phone字段为null）...');

    try {
        const token = await getAuthToken();
        console.log('✅ 认证成功');

        const testData = {
            name: '测试餐厅',
            address: '测试地址',
            phone: null, // 测试null值
            description: '这是一个测试餐厅',
            type: 'mainfood',
            cover: '/logo.png',
            tags: ['测试'],
            preview: [],
            openTime: '9:00-21:00',
            rating: 5,
            latitude: 30.5951,
            longitude: 114.4086,
        };

        const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(testData),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log('✅ 餐厅创建成功！', result.data);

            // 清理测试数据
            const deleteResponse = await fetch(
                `${API_BASE_URL}/api/admin/restaurant/${result.data.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (deleteResponse.ok) {
                console.log('✅ 测试数据清理成功');
            }

            return true;
        } else {
            console.error('❌ 餐厅创建失败:', result.message || result);
            return false;
        }
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 开始测试餐厅创建API...');
    const success = await testRestaurantCreation();

    if (success) {
        console.log('🎉 测试成功！phone字段可选性正常工作');
    } else {
        console.log('❌ 测试失败！phone字段可选性有问题');
    }
}

if (import.meta.main) {
    main();
}
