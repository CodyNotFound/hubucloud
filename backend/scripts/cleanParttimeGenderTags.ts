#!/usr/bin/env bun
import { db } from '../src/utils/db';

/**
 * 清理兼职数据中的性别相关标签
 * 移除 tags 中的性别标签，统一使用 requirements 字段显示性别要求
 */
async function cleanParttimeGenderTags() {
    console.log('🔄 开始清理兼职数据中的性别相关标签...');

    try {
        // 获取所有兼职数据
        const parttimes = await db.parttime.findMany({
            select: {
                id: true,
                name: true,
                tags: true,
                requirements: true,
            },
        });

        console.log(`📋 找到 ${parttimes.length} 条兼职记录`);

        let updatedCount = 0;
        const genderRelatedTags = ['男生', '女生', '男生优先', '女生优先', '限男生', '限女生'];

        for (const parttime of parttimes) {
            // 过滤掉性别相关的标签
            const originalTags = parttime.tags;
            const filteredTags = parttime.tags.filter(
                (tag) => !genderRelatedTags.includes(tag)
            );

            // 检查是否有性别标签被移除
            const hasGenderTags = originalTags.length !== filteredTags.length;

            if (hasGenderTags) {
                await db.parttime.update({
                    where: { id: parttime.id },
                    data: { tags: filteredTags },
                });

                const removedTags = originalTags.filter(tag => genderRelatedTags.includes(tag));

                console.log(`✅ 更新: ${parttime.name}`);
                console.log(`   移除的性别标签: [${removedTags.join(', ')}]`);
                console.log(`   保留的标签: [${filteredTags.join(', ')}]`);
                console.log(`   性别要求(requirements): ${parttime.requirements || '无'}`);
                console.log('');
                updatedCount++;
            }
        }

        console.log(`\n🎉 清理完成！更新了 ${updatedCount} 条兼职记录，移除了性别相关标签`);
        console.log('💡 现在性别要求将统一通过 requirements 字段显示');
    } catch (error) {
        console.error('❌ 清理过程中发生错误:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    cleanParttimeGenderTags().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}