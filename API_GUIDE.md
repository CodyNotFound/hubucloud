# 湖大萧云 API 指南

## 概述

本项目已成功将后端从独立的 Hono 服务器迁移到 Next.js API Routes。所有 API 现在通过 Next.js 提供，可以直接部署到 Vercel。

## API 端点

### 健康检查
- `GET /api/health` - 服务健康状态检查

### 用户认证
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息（需要认证）

### 用户管理
- `GET /api/users` - 获取用户列表（需要管理员权限）
- `GET /api/users/[id]` - 获取用户详情
- `PUT /api/users/[id]` - 更新用户信息
- `DELETE /api/users/[id]` - 删除用户（需要管理员权限）

### 餐厅管理
- `GET /api/restaurants` - 获取餐厅列表
- `POST /api/restaurants` - 创建餐厅
- `GET /api/restaurants/search` - 搜索餐厅
- `GET /api/restaurants/[id]` - 获取餐厅详情
- `PUT /api/restaurants/[id]` - 更新餐厅信息
- `DELETE /api/restaurants/[id]` - 删除餐厅

### 兼职管理
- `GET /api/parttime` - 获取兼职列表
- `POST /api/parttime` - 发布兼职
- `GET /api/parttime/search` - 搜索兼职
- `GET /api/parttime/[id]` - 获取兼职详情
- `PUT /api/parttime/[id]` - 更新兼职信息
- `DELETE /api/parttime/[id]` - 删除兼职
- `GET /api/parttime/type/[type]` - 按类型获取兼职
- `POST /api/parttime/parse-contact` - 解析联系方式
- `POST /api/parttime/parse-requirements` - 解析要求信息

### 管理员功能
- `GET /api/admin/check` - 检查管理员权限
- `POST /api/admin/init-admin` - 初始化第一个管理员
- `GET /api/admin/stats` - 获取统计信息
- `POST /api/admin/promote-user` - 提升用户为管理员
- `POST /api/admin/demote-admin` - 撤销管理员权限

### 文件上传
- `POST /api/upload/image` - 上传单张图片
- `POST /api/upload/images` - 批量上传图片

## 认证

API 使用 JWT 进行身份验证。在请求头中包含：

```
Authorization: Bearer <your-jwt-token>
```

## 数据库设置

1. 设置 PostgreSQL 数据库
2. 更新 `.env.local` 中的 `DATABASE_URL`
3. 运行数据库迁移：

```bash
bunx prisma migrate dev
```

## 启动服务

```bash
bun run dev
```

服务将运行在 `http://localhost:3000`

## 部署到 Vercel

1. 推送代码到 GitHub
2. 连接 Vercel 到你的仓库
3. 设置环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. 部署

## 主要变化

- ✅ 移除了独立的 Hono 后端服务器
- ✅ 所有 API 现在通过 Next.js API Routes 提供
- ✅ 保持了所有原有的功能和接口结构
- ✅ 使用相同的数据库模式和验证逻辑
- ✅ 支持图片上传和处理
- ✅ 保持了管理员权限系统
- ✅ 可以直接部署到 Vercel

## 文件结构

```
app/
├── api/
│   ├── health/
│   ├── users/
│   ├── restaurants/
│   ├── parttime/
│   ├── admin/
│   └── upload/
lib/
├── db.ts          # 数据库连接
├── jwt.ts         # JWT 工具
├── auth.ts        # 认证中间件
├── response.ts    # 统一响应格式
└── parttime.ts    # 兼职相关工具
prisma/
└── schema.prisma  # 数据库模式
```