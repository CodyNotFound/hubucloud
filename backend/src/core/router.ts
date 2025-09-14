import type { Hono, Context } from 'hono';

import { getControllerMetadata } from '../decorators/controller';
import { ROUTE_METADATA } from '../decorators/http';
import { getParameterMetadata, ParamType } from '../decorators/params';
import { Validator } from '../decorators/validation';

import { ResponseUtil } from './response';
import { controllerRegistry } from './controller-registry';

/**
 * 规范化路径，确保：
 * 1. 以/开头
 * 2. 不以/结尾（除非是根路径）
 * 3. 不会有重复的/
 */
function normalizePath(inputPath: string): string {
    // 确保以/开头
    const withLeadingSlash = inputPath.startsWith('/') ? inputPath : `/${inputPath}`;

    // 移除结尾的/（除非是根路径）
    const withoutTrailingSlash =
        withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
            ? withLeadingSlash.slice(0, -1)
            : withLeadingSlash;

    // 替换多个连续的/为单个/
    return withoutTrailingSlash.replace(/\/+/g, '/');
}

/**
 * 创建参数提取和验证的包装函数
 */
async function createParameterHandler(c: Context, instance: any, handlerName: string) {
    const paramMetadata = getParameterMetadata(instance, handlerName);

    // 如果没有参数装饰器，就只传递Context
    if (paramMetadata.length === 0) {
        return [c];
    }

    const args: any[] = [];

    // 获取函数参数长度
    const originalMethod = instance[handlerName];
    const paramLength = originalMethod.length;

    // 初始化参数数组，第一个参数是Context
    for (let i = 0; i < paramLength; i++) {
        args[i] = i === 0 ? c : undefined;
    }

    // 根据参数元数据提取参数
    for (const param of paramMetadata) {
        let value: any;

        switch (param.type) {
            case ParamType.Body:
                const body = await c.req.json().catch(() => ({}));
                value = param.name ? body[param.name] : body;
                break;
            case ParamType.Query:
                value = param.name ? c.req.query(param.name) : c.req.query();
                break;
            case ParamType.Param:
                value = param.name ? c.req.param(param.name) : c.req.param();
                break;
            case ParamType.Header:
                value = param.name ? c.req.header(param.name) : c.req.header();
                break;
            case ParamType.Request:
                value = c;
                break;
            default:
                value = undefined;
        }

        // 验证参数
        if (param.validations && param.validations.length > 0) {
            const validation = Validator.validate(value, param.validations);
            if (!validation.isValid) {
                throw new Error(`参数验证失败: ${validation.errors.join(', ')}`);
            }
        }

        // 将值设置到正确的参数位置
        if (param.index < args.length) {
            args[param.index] = value;
        }
    }

    return args;
}

/**
 * 注册单个控制器的路由
 */
function registerController(app: Hono, controller: any) {
    const routes = Reflect.getMetadata(ROUTE_METADATA, controller) || [];
    const instance = new controller();
    const prefix = getControllerMetadata(controller);

    for (const route of routes) {
        const { path, method, handlerName, middlewares } = route;
        const originalHandler = instance[handlerName].bind(instance);
        const methodName = method.toLowerCase() as keyof Hono;

        // 创建包装处理函数
        const wrappedHandler = async (c: Context) => {
            try {
                const args = await createParameterHandler(c, instance, handlerName);
                return await originalHandler(...args);
            } catch (error) {
                if (error instanceof Error && error.message.includes('参数验证失败')) {
                    return ResponseUtil.clientError(c, error.message, 400);
                }
                return ResponseUtil.serverError(c, '请求处理失败', error as Error);
            }
        };

        // 规范化路径
        const fullPath = normalizePath(`${prefix}${path}`);

        if (middlewares && middlewares.length > 0) {
            (app[methodName] as Function)(fullPath, ...middlewares, wrappedHandler);
        } else {
            (app[methodName] as Function)(fullPath, wrappedHandler);
        }
    }

    return app;
}

/**
 * 注册所有已注册的控制器的路由
 */
export function registerRoutes(app: Hono): Hono {
    const controllers = controllerRegistry.getControllers();

    for (const controller of controllers) {
        registerController(app, controller);
    }

    return app;
}
