#!/usr/bin/env bun
/**
 * 测试兼职迁移脚本
 */

const API_BASE_URL = 'http://localhost:3002';

// JWT Token
const JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZwNmpjcWcwMDAwM3N2Z21ocnJ4ZDR1IiwidXNlcm5hbWUiOiJjb2R5Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU4MTg2MTU5LCJleHAiOjE3NTg3OTA5NTksImF1ZCI6Imh1YnVjbG91ZC11c2VycyIsImlzcyI6Imh1YnVjbG91ZCJ9.49o8rp75iaOrrh7PLl2r0SkuNrjimTt6pTS3ZJQoiZ4';

async function testParttimeCreation() {
    console.log('🧪 测试兼职创建...');

    const testData = {
        name: '测试兼职岗位',
        type: '校园兼职',
        salary: '面议',
        worktime: '灵活时间',
        location: '湖北大学',
        description: '这是一个测试兼职，用于验证API是否正常工作',
        contact: '13812345678',
        requirements: '无特殊要求',
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/parttime`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
            body: JSON.stringify(testData),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log('✅ 兼职创建成功！', result.data);
            return result.data.id;
        } else {
            console.error('❌ 兼职创建失败:', result.message || result);
            return null;
        }
    } catch (error) {
        console.error('❌ 网络错误:', error);
        return null;
    }
}

async function testParttimeList() {
    console.log('📋 测试兼职列表获取...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/parttime`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log('✅ 获取兼职列表成功，数量:', result.data.parttimes.length);
            return true;
        } else {
            console.error('❌ 获取兼职列表失败:', result.message || result);
            return false;
        }
    } catch (error) {
        console.error('❌ 网络错误:', error);
        return false;
    }
}

async function testParttimeDelete(id: string) {
    console.log('🗑️ 测试删除兼职...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/parttime/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${JWT_TOKEN}`,
            },
        });

        if (response.ok) {
            console.log('✅ 兼职删除成功');
            return true;
        } else {
            console.error('❌ 兼职删除失败');
            return false;
        }
    } catch (error) {
        console.error('❌ 网络错误:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 开始兼职API测试...');

    // 测试创建
    const parttimeId = await testParttimeCreation();
    if (!parttimeId) {
        console.error('❌ 创建测试失败，停止后续测试');
        return;
    }

    // 测试列表
    await testParttimeList();

    // 清理测试数据
    await testParttimeDelete(parttimeId);

    console.log('🎉 兼职API测试完成！');
}

if (import.meta.main) {
    main();
}
