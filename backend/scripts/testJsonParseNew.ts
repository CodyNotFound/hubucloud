#!/usr/bin/env bun

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

        console.log(`解析: ${str} -> ${cleanStr}`);
        const parsed = JSON.parse(cleanStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.log(`解析失败: ${str}`, error);
        return [];
    }
}

const tests = [
    '[/api/upload/2025/09/15/1757907826972_847b5c17.JPG,/api/upload/2025/09/15/1757907826983_175e1bed.JPG]',
    '[咖啡]',
    '[""/api/upload/2025/09/11/1757539076167_99828623.jpg""]',
];

for (const test of tests) {
    console.log('\n测试:', test);
    const result = parseJSONArray(test);
    console.log('结果:', result);
}
