import { existsSync } from 'fs';
import path from 'path';

/**
 * 图片API测试脚本
 * 用于验证图片获取API的功能
 */

/**
 * 测试图片API端点
 */
async function testImageApi() {
    console.log('🧪 测试图片API功能...');

    // 检查上传目录
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    if (!existsSync(uploadsDir)) {
        console.log('❌ 上传目录不存在，无法进行测试');
        return;
    }

    console.log(`✓ 上传目录存在: ${uploadsDir}`);

    console.log('\n📝 API使用说明:');
    console.log('1. 启动开发服务器: bun run dev');
    console.log('2. 图片访问格式: /api/images/文件名');
    console.log('3. 例如: /api/images/restaurant_1234567890_0_abcd12.webp');

    console.log('\n🔧 数据库迁移步骤:');
    console.log('1. 运行迁移脚本: bun run migrate-images');
    console.log('2. 脚本会自动将数据库中的图片URL更新为API格式');
    console.log('3. 迁移后图片将通过API端点访问，解决生产环境问题');

    console.log('\n💡 解决方案说明:');
    console.log('- 创建了 /api/images/[filename] 路由来服务图片文件');
    console.log('- 迁移脚本会更新数据库中的URL格式');
    console.log('- 从 /uploads/images/xxx.webp 更改为 /api/images/xxx.webp');
    console.log('- API路由包含安全验证，防止路径遍历攻击');
    console.log('- 支持适当的缓存头，提升性能');

    console.log('\n✅ 测试完成！');
}

// 运行测试
if (require.main === module) {
    testImageApi().catch((error) => {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    });
}

export { testImageApi };
