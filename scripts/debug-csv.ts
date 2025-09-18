#!/usr/bin/env bun

/**
 * 调试CSV解析
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function parseCSVRecord(headers: string[], values: string[]): Record<string, string> {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
        record[header.replace(/"/g, '')] = values[index]?.replace(/"/g, '') || '';
    });
    return record;
}

// 读取 CSV 数据
const csvPath = join(rootDir, 'migration', 'restaurants.csv');
const csvContent = readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = parseCSVLine(lines[0]);

console.log('Headers:', headers);

// 只处理第2条记录
const values = parseCSVLine(lines[2]);
const data = parseCSVRecord(headers, values);

console.log('\n薄冰牛肉粉数据:');
console.log('名称:', data.name);
console.log('分类:', data.category);
console.log('原始图片数据:', data.images);
console.log('图片数据长度:', data.images?.length);
console.log('图片数据类型:', typeof data.images);

if (data.images) {
    console.log('\n尝试处理图片数据:');
    console.log('1. 原始:', data.images);

    let step1 = data.images.replace(/""/g, '"');
    console.log('2. 替换""为":', step1);

    try {
        const parsed = JSON.parse(step1);
        console.log('3. 解析成功:', parsed);
    } catch (error) {
        console.log('3. 解析失败:', error);

        // 尝试其他方法
        console.log('\n尝试其他解析方法:');
        try {
            const escaped = step1.replace(/\\/g, '\\\\');
            console.log('4. 转义反斜杠:', escaped);
            const parsed2 = JSON.parse(escaped);
            console.log('5. 解析成功:', parsed2);
        } catch (error2) {
            console.log('5. 还是失败:', error2);
        }
    }
}