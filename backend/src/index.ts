import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { registerRoutes } from '@/core/router';
import { accessLogger, performanceLogger } from '@/core/middleware';
import logger from '@/utils/logger';

// 导入所有控制器以确保装饰器执行
import '@/controllers/restaurant';
import '@/controllers/parttime';
import '@/controllers/admin';
import '@/controllers/user';

const app = new Hono();

// 全局中间件
app.use(
    '*',
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
);

app.use('*', accessLogger);
app.use('*', performanceLogger(1000));

// 健康检查端点
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// 注册所有控制器路由
registerRoutes(app);

// 404处理
app.notFound((c) => {
    return c.json(
        {
            status: 'error',
            message: '接口不存在',
            timestamp: new Date().toISOString(),
        },
        404
    );
});

// 错误处理
app.onError((err, c) => {
    logger.error(`Server error: ${err.message}`, err);
    return c.json(
        {
            status: 'error',
            message: '服务器内部错误',
            timestamp: new Date().toISOString(),
        },
        500
    );
});

const port = Number(process.env.PORT) || 8000;

logger.info(`服务器启动在端口 ${port}`);
logger.info(`健康检查: http://localhost:${port}/health`);
logger.info(`用户API: http://localhost:${port}/api/users`);
logger.info(`餐厅API: http://localhost:${port}/api/restaurants`);
logger.info(`管理员API: http://localhost:${port}/api/admin`);

export default {
    port,
    fetch: app.fetch,
};
