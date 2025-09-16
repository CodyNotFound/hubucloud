#!/usr/bin/env bun

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

        // 修复双引号问题 [""/path""] -> ["/path"]
        cleanStr = cleanStr.replace(/\[""/g, '["').replace(/""\]/g, '"]');
        // 修复中间的双引号 "",""path"",""  -> ","path",
        cleanStr = cleanStr.replace(/""([^"]*)""/g, '"$1"');

        console.log(`📝 解析JSON: ${str} -> ${cleanStr}`);

        const parsed = JSON.parse(cleanStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log(`⚠️  JSON解析失败: ${str}`, error);
        return [];
    }
}

// 测试用例
const testCases = [
    '[""/api/upload/2025/09/11/1757539076167_99828623.jpg""]',
    '"[""咖啡""]"',
    '"[""/api/upload/2025/09/11/1757539076167_99828623.jpg""]"',
    '[/api/upload/2025/09/15/1757907826972_847b5c17.JPG,/api/upload/2025/09/15/1757907826983_175e1bed.JPG]',
    '[咖啡]',
];

console.log('🧪 开始测试JSON解析...\n');

for (let i = 0; i < testCases.length; i++) {
    console.log(`测试${i + 1}: ${testCases[i]}`);
    const result = parseJSONArray(testCases[i]);
    console.log(`结果: `, result);
    console.log('---\n');
}
