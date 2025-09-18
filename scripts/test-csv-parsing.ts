#!/usr/bin/env bun

/**
 * 测试CSV图片数据解析
 */

// 测试图片数据
const testImageData = `[""/api/upload/2025/09/15/1757907826972_847b5c17.JPG"",""/api/upload/2025/09/15/1757907826983_175e1bed.JPG"",""/api/upload/2025/09/15/1757907826987_0cf6de78.JPG"",""/api/upload/2025/09/15/1757907826994_5f67cadd.JPG""]`;

console.log('原始数据:', testImageData);

// 方法1: 替换双引号
let method1 = testImageData.replace(/""/g, '"');
console.log('方法1:', method1);

try {
    const parsed1 = JSON.parse(method1);
    console.log('方法1解析成功:', parsed1);
} catch (error) {
    console.log('方法1解析失败:', error);
}

// 方法2: 手动处理
let method2 = testImageData;
// 先替换 "" 为单引号
method2 = method2.replace(/""/g, "'");
// 再将单引号替换为双引号
method2 = method2.replace(/'/g, '"');
console.log('方法2:', method2);

try {
    const parsed2 = JSON.parse(method2);
    console.log('方法2解析成功:', parsed2);
} catch (error) {
    console.log('方法2解析失败:', error);
}

// 方法3: 正确的CSV引号处理
let method3 = testImageData;
// CSV中 "" 表示转义的引号，应该替换为单个引号
method3 = method3.replace(/""/g, '"');
console.log('方法3:', method3);

try {
    const parsed3 = JSON.parse(method3);
    console.log('方法3解析成功:', parsed3);
} catch (error) {
    console.log('方法3解析失败:', error);
}