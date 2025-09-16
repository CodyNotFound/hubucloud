#!/usr/bin/env bun
import { db } from '../src/utils/db';

/**
 * 修复兼职数据中的性别标签
 * 将"女生优先"、"男生优先"改为"女生"、"男生"
 */
async function fixParttimeGenderTags() {
    console.log('🔄 开始修复兼职数据中的性别标签...');

    try {
        // 获取所有兼职数据
        const parttimes = await db.parttime.findMany({
            select: {
                id: true,
                name: true,
                tags: true,
            },
        });

        console.log(`📋 找到 ${parttimes.length} 条兼职记录`);

        let updatedCount = 0;

        for (const parttime of parttimes) {
            let needsUpdate = false;
            const updatedTags = parttime.tags.map((tag) => {
                if (tag === '女生优先') {
                    needsUpdate = true;
                    return '女生';
                }
                if (tag === '男生优先') {
                    needsUpdate = true;
                    return '男生';
                }
                return tag;
            });

            if (needsUpdate) {
                await db.parttime.update({
                    where: { id: parttime.id },
                    data: { tags: updatedTags },
                });

                console.log(`✅ 更新: ${parttime.name}`);
                console.log(`   原标签: [${parttime.tags.join(', ')}]`);
                console.log(`   新标签: [${updatedTags.join(', ')}]`);
                updatedCount++;
            }
        }

        console.log(`\n🎉 修复完成！更新了 ${updatedCount} 条兼职记录的性别标签`);
    } catch (error) {
        console.error('❌ 修复过程中发生错误:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    fixParttimeGenderTags().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}
