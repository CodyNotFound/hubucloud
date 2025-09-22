#!/usr/bin/env bun
import { writeFileSync } from 'fs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('📤 开始备份数据库...');

        const data = {
            users: await prisma.user.findMany(),
            restaurants: await prisma.restaurant.findMany(),
            parttimes: await prisma.parttime.findMany(),
            backupTime: new Date().toISOString(),
        };

        const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
        writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log(`✅ 备份完成: ${filename}`);
        console.log(`   用户: ${data.users.length}`);
        console.log(`   餐厅: ${data.restaurants.length}`);
        console.log(`   兼职: ${data.parttimes.length}`);
    } catch (error: any) {
        console.error('❌ 备份失败:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
