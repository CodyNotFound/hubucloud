---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: '*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json'
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

# 湖大萧云Backend项目架构指南

## 项目概述

这是一个基于装饰器模式的TypeScript后端框架，使用Hono作为HTTP服务器，采用了控制器-路由-中间件的分层架构。项目结构清晰，支持依赖注入、参数验证、统一响应格式等企业级功能。

## 核心技术栈

- **运行时**: Bun (替代Node.js)
- **Web框架**: Hono
- **数据库**: Prisma ORM
- **装饰器支持**: reflect-metadata
- **语言**: TypeScript

## 项目结构

```
src/
├── core/                    # 核心功能模块
│   ├── controller-registry.ts   # 控制器注册中心
│   ├── router.ts               # 路由注册器
│   ├── request-context.ts      # 请求上下文管理
│   ├── response.ts             # 统一响应格式
│   └── middleware.ts           # 中间件集合
├── decorators/              # 装饰器模块
│   ├── controller.ts           # @Controller 装饰器
│   ├── http.ts                 # HTTP方法装饰器 (@Get, @Post等)
│   ├── params.ts               # 参数装饰器 (@Body, @Query等)
│   ├── validation.ts           # 验证装饰器 (@Required, @Email等)
│   └── types.ts                # 类型装饰器
├── controllers/            # 控制器目录 (待实现)
├── utils/                  # 工具函数
└── index.ts               # 应用入口 (待实现)
```

## 控制器系统

### 1. 控制器装饰器

使用 `@Controller` 装饰器定义控制器类：

```typescript
import { Controller } from '@/decorators/controller';
import { Get, Post } from '@/decorators/http';
import { Body, Query, Param } from '@/decorators/params';
import { Required, Email } from '@/decorators/validation';

@Controller('/api/users')
export class UserController {
    @Get('/')
    async getUsers(@Query('page') page?: number) {
        // 获取用户列表
        return ResponseUtil.success(c, users);
    }

    @Get('/:id')
    async getUserById(@Param('id') id: string) {
        // 根据ID获取用户
        return ResponseUtil.success(c, user);
    }

    @Post('/')
    async createUser(
        @Body('name') @Required() name: string,
        @Body('email') @Email() @Required() email: string
    ) {
        // 创建新用户
        return ResponseUtil.success(c, newUser, '用户创建成功');
    }
}
```

### 2. HTTP方法装饰器

支持所有标准HTTP方法：

- `@Get(path, ...middlewares)` - GET请求
- `@Post(path, ...middlewares)` - POST请求
- `@Put(path, ...middlewares)` - PUT请求
- `@Delete(path, ...middlewares)` - DELETE请求
- `@Patch(path, ...middlewares)` - PATCH请求

### 3. 参数装饰器

从请求中提取不同类型的参数：

- `@Body(field?)` - 请求体参数
- `@Query(field?)` - 查询参数
- `@Param(field?)` - 路径参数
- `@Header(field?)` - 请求头参数
- `@Req()` - 完整请求对象

### 4. 验证装饰器

内置参数验证装饰器：

- `@Required()` - 必填验证
- `@Email()` - 邮箱格式验证
- `@Length(min, max?)` - 字符串长度验证
- `@IsNumber(min?, max?)` - 数字范围验证

## Core架构模块

### 1. 控制器注册中心 (ControllerRegistry)

**位置**: `src/core/controller-registry.ts`

单例模式管理所有控制器：

```typescript
// 自动注册（通过@Controller装饰器）
@Controller('/api/users')
export class UserController { ... }

// 手动获取所有控制器
const controllers = controllerRegistry.getControllers();
```

### 2. 路由注册器 (Router)

**位置**: `src/core/router.ts`

自动将控制器转换为Hono路由：

```typescript
import { registerRoutes } from '@/core/router';
import { Hono } from 'hono';

const app = new Hono();
registerRoutes(app); // 自动注册所有控制器路由
```

**特性**:

- 自动路径规范化（去除重复斜杠、处理前缀）
- 支持路由级中间件
- 自动绑定控制器方法上下文

### 3. 请求上下文 (RequestContext)

**位置**: `src/core/request-context.ts`

使用AsyncLocalStorage提供线程安全的请求上下文：

```typescript
// 在任何地方获取当前请求
const currentRequest = RequestContext.getCurrentRequest();

// 在请求上下文中执行代码
RequestContext.run(req, () => {
    // 在这里可以访问请求上下文
});
```

### 4. 统一响应格式 (ResponseUtil)

**位置**: `src/core/response.ts`

提供标准化的API响应格式：

```typescript
// 成功响应
return ResponseUtil.success(c, data, '操作成功');

// 错误响应
return ResponseUtil.error(c, '参数错误', 400);

// 服务器错误（自动记录日志）
return ResponseUtil.error(c, '系统异常', 500, true, error);
```

**响应格式**:

```typescript
interface StandardResponse<T = unknown> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    requestId?: string; // 服务器错误时提供
    timestamp?: string;
}
```

### 5. 中间件集合 (Middleware)

**位置**: `src/core/middleware.ts`

提供常用中间件：

- `accessLogger` - 访问日志记录
- `performanceLogger(thresholdMs)` - 性能监控
- `staticFileMiddleware` - 静态文件服务

## 使用指南

### 创建新控制器

1. **创建控制器文件**:

```typescript
// src/controllers/user.ts
import { Controller } from '@/decorators/controller';
import { Get, Post } from '@/decorators/http';
import { ResponseUtil } from '@/core/response';

@Controller('/api/users')
export class UserController {
    @Get('/')
    async getUsers(c: Context) {
        const users = []; // 获取用户数据
        return ResponseUtil.success(c, users);
    }
}
```

2. **确保导入控制器** (在入口文件或路由配置中):

```typescript
import './controllers/user'; // 确保装饰器执行
```

### 添加参数验证

```typescript
@Post('/')
async createUser(
    c: Context,
    @Body('name') @Required() @Length(2, 50) name: string,
    @Body('email') @Email() @Required() email: string,
    @Body('age') @IsNumber(18, 120) age: number
) {
    // 参数会自动验证和提取
}
```

### 使用中间件

```typescript
import { accessLogger } from '@/core/middleware';

// 路由级中间件
@Get('/', accessLogger)
async getUsers(c: Context) {
    // ...
}

// 全局中间件（在app配置中）
app.use('*', accessLogger);
```

### 自定义验证规则

```typescript
import { Validator } from '@/decorators/validation';

// 注册自定义验证
Validator.registerValidation('phone', (value: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return {
        isValid: phoneRegex.test(value),
        error: phoneRegex.test(value) ? null : '手机号格式不正确',
    };
});

// 使用自定义验证
function Phone() {
    return createValidationDecorator('phone');
}
```

## 最佳实践

1. **控制器命名**: 使用 `*.controller.ts` 后缀
2. **路径设计**: 使用RESTful风格的路径结构
3. **错误处理**: 使用 `ResponseUtil.error` 统一错误响应
4. **参数验证**: 始终为用户输入添加验证装饰器
5. **日志记录**: 使用内置的访问日志和性能监控中间件
6. **类型安全**: 充分利用TypeScript类型系统
7. **模块化**: 按功能模块组织控制器

## 开发命令

```bash
# 数据库相关
bun run db:generate    # 生成Prisma客户端
bun run db:migrate     # 运行数据库迁移
bun run db:studio      # 打开Prisma Studio
bun run db            # 生成+迁移一键执行

# 开发调试
bun --hot src/index.ts # 热重载开发模式
bun run dev           # 开发模式（需要在package.json中配置）
```
