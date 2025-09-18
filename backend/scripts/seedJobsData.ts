#!/usr/bin/env bun
import { db } from '../src/utils/db';

// 示例兼职工作数据
const jobsData = [
    {
        name: '校园奶茶店兼职',
        type: '服务员',
        description:
            '负责奶茶制作、收银、清洁等工作。工作环境轻松愉快，同事友善。适合大学生兼职，时间灵活。',
        salary: '20-25元/小时',
        worktime: '周末或课余时间，每周15-20小时',
        location: '湖北大学校内奶茶店',
        contact: '微信: milktea_job2024',
        requirements: '有责任心，学习能力强，能够快速上手。有相关经验者优先。',
    },
    {
        name: '家教老师 - 高中数学',
        type: '家教',
        description: '为高二学生提供数学辅导，帮助提高成绩。学生基础较好，主要需要解答疑难问题。',
        salary: '80-100元/小时',
        worktime: '周六日下午，每次2小时',
        location: '武昌区水果湖附近',
        contact: '电话: 138****2468',
        requirements: '数学专业或理工科专业学生，有耐心，善于沟通。有家教经验者优先。',
    },
    {
        name: '图书馆管理员助理',
        type: '管理员',
        description: '协助图书管理，整理书籍，帮助读者查找资料。工作环境安静，适合喜欢读书的同学。',
        salary: '15元/小时',
        worktime: '每周三个工作日，每天4小时',
        location: '湖北大学图书馆',
        contact: '邮箱: library_jobs@hubu.edu.cn',
        requirements: '细心负责，有良好的服务意识。图书情报专业学生优先。',
    },
    {
        name: '活动策划助理',
        type: '策划助理',
        description: '协助策划校园活动，包括文案撰写、现场布置、活动执行等。可以锻炼组织协调能力。',
        salary: '按项目计算，500-1500元/项目',
        worktime: '根据活动安排，灵活时间',
        location: '湖北大学及周边',
        contact: '微信: event_planner_hu',
        requirements: '有创意，沟通能力强，能够承受一定工作压力。有活动经验者优先。',
    },
    {
        name: '外卖配送员 - 校园专线',
        type: '配送员',
        description: '负责校园内外卖配送，熟悉校园环境，服务同学。提供电动车，工作时间灵活。',
        salary: '每单5-8元，月入2000-4000元',
        worktime: '11:00-14:00, 17:00-21:00',
        location: '湖北大学校园及周边',
        contact: '电话: 159****7890',
        requirements: '身体健康，有电动车驾驶经验。熟悉校园环境者优先。',
    },
    {
        name: '社交媒体运营实习生',
        type: '运营实习',
        description:
            '负责公司微信公众号、抖音等平台内容运营，撰写文案，制作图片视频。可学习新媒体运营技能。',
        salary: '3000-4000元/月 (实习)',
        worktime: '周一到周五，每天4-6小时',
        location: '光谷软件园',
        contact: '邮箱: hr@company.com',
        requirements: '新闻传播或相关专业，有一定写作能力，熟悉各类社交媒体平台。',
    },
    {
        name: '英语口语陪练老师',
        type: '家教',
        description: '为小学生提供英语口语练习，通过游戏和对话提高孩子的英语兴趣和口语能力。',
        salary: '60-80元/小时',
        worktime: '周末及平日晚上，时间灵活',
        location: '汉口或武昌区',
        contact: '微信: english_tutor123',
        requirements: '英语专业或英语水平较高，发音标准，喜欢与孩子交流。',
    },
    {
        name: '校园快递分拣员',
        type: '分拣员',
        description: '负责快递包裹分拣、录入、派发等工作。工作相对简单，但需要一定体力。',
        salary: '18-22元/小时',
        worktime: '每天3-4小时，时间灵活安排',
        location: '湖北大学快递服务中心',
        contact: '电话: 027-88888888',
        requirements: '身体健康，能够搬运重物。有责任心，工作认真细致。',
    },
    {
        name: 'IT技术支持兼职',
        type: '技术支持',
        description: '为小型企业提供电脑维护、软件安装、网络设置等技术支持服务。',
        salary: '50-80元/小时',
        worktime: '根据需求安排，一般周末',
        location: '武汉市内各区域',
        contact: '邮箱: tech_support@service.com',
        requirements: '计算机相关专业，熟悉Windows系统，有一定网络知识。',
    },
    {
        name: '美术培训助教',
        type: '助教',
        description: '协助美术老师进行儿童绘画教学，准备教学材料，维持课堂秩序。',
        salary: '25-35元/小时',
        worktime: '周末及寒暑假，每次2-3小时',
        location: '武昌区美术培训机构',
        contact: '微信: art_teacher_wh',
        requirements: '美术专业或有绘画基础，有耐心，喜欢与儿童互动。',
    },
];

async function seedJobsData() {
    console.log('开始添加兼职工作数据...');

    try {
        // 清空现有数据（可选）
        console.log('清空现有兼职数据...');
        await db.parttime.deleteMany({});

        // 添加新数据
        console.log('添加新的兼职工作数据...');
        for (const job of jobsData) {
            const createdJob = await db.parttime.create({
                data: job,
            });
            console.log(`✅ 创建兼职工作: ${createdJob.name} (ID: ${createdJob.id})`);
        }

        console.log(`🎉 成功添加 ${jobsData.length} 条兼职工作数据！`);

        // 显示添加的数据
        const jobs = await db.parttime.findMany({
            orderBy: { createdAt: 'desc' },
        });

        console.log('\n📋 当前所有兼职工作:');
        jobs.forEach((job, index) => {
            console.log(`${index + 1}. ${job.name} - ${job.salary}`);
            console.log(`   📍 ${job.location}`);
            console.log(`   💼 ${job.type}\n`);
        });
    } catch (error) {
        console.error('❌ 添加数据时发生错误:', error);
    } finally {
        await db.$disconnect();
    }
}

// 如果直接运行此脚本
if (import.meta.main) {
    seedJobsData().catch((error) => {
        console.error('执行失败:', error);
        process.exit(1);
    });
}

export { seedJobsData, jobsData };
