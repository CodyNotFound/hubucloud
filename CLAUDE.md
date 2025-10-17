# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 湖大萧云项目 - Claude AI 指导文档

## 项目概述

这是一个为湖北大学学生服务的校园生活平台，提供论坛、活动、快递、跳蚤市场、失物招领、兼职等服务。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI库**: HeroUI (基于React Aria)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT (jsonwebtoken)
- **样式**: Tailwind CSS
- **图标**: Lucide React (优先使用)
- **PWA**: Serwist (Service Worker)
- **包管理器**: Bun (永远不要使用npm)
- **语言**: TypeScript + 简体中文

## 开发规范

### 1. 依赖管理

- **优先使用**: `bun add` 安装依赖
- **npm库偏好**: 选择更活跃、更流行、更新频率高的库
- **示例**: 优先使用 `yaml` 而不是 `js-yaml`

### 2. 图标使用

- **主要图标库**: Lucide React
- **导入方式**: `import { IconName } from 'lucide-react'`
- **替换原则**: 将现有的自定义图标组件替换为Lucide图标

### 3. 设计理念

- **纯手机端设计**: 专注于手机端用户体验，充分利用屏幕宽度
- **布局**: 不使用响应式断点，固定手机端布局
- **空间利用**: 最大化内容展示区域，最小化不必要的空白边距

### 4. 组件结构

```
components/
├── hero-carousel.tsx    # 首页轮播组件
├── navbar.tsx          # 导航栏组件
├── icons.tsx           # 自定义图标组件 (逐渐迁移到Lucide)
└── ...
```

### 5. 路由配置

```
app/
├── page.tsx            # 首页 - 轮播图 + 服务网格
├── layout.tsx          # 全局布局
├── forum/              # 论坛
├── activity/           # 活动
├── express/            # 快递
├── market/             # 跳蚤市场
├── lost-found/         # 失物招领
├── jobs/               # 兼职
└── profile/            # 个人中心
```

### 6. 中文化要求

- **界面文本**: 全部使用简体中文
- **代码注释**: 使用简体中文
- **变量命名**: 使用英文，但要有清晰的中文注释

### 7. 运行要求

- 不需要检查 link
- 不需要运行或者编译
- 可以使用 ide 检查代码问题

## 开发指南

### 新增功能页面

1. 在 `app/` 目录下创建对应路由文件夹
2. 使用完全HeroUI组件库构建界面
3. 采用固定手机端布局设计
4. 集成Lucide图标

### 样式指南

- 使用Tailwind CSS utility classes
- 遵循HeroUI的设计系统
- 深色主题为默认主题
- 组件间距使用4的倍数 (gap-4, p-4, m-4等)

### 页面布局规范

#### 统一布局约定 (手机端优化)

**重要**: layout.tsx 已经在 main 元素中统一处理了页面间距 (`px-4 py-4`)，所有页面组件**不需要**再添加外层容器和间距。

- **页面根元素**: 页面组件直接返回内容，不需要包装容器div
- **section边距**: 各section间使用 `py-2` (紧凑布局)
- **卡片间距**: 卡片之间使用 `space-y-2` 或 `gap-2` (减少间隙)
- **内容间距**: 标题与内容间使用 `mb-3` (适中间距)

#### 页面结构模板 (简化版)

```tsx
export default function PageName() {
    return (
        <>
            <section className="w-full py-2">
                {/* 页面标题区 */}
                <div className="text-center mb-3">
                    <h2 className="text-xl font-bold mb-2">页面标题</h2>
                    <p className="text-sm text-default-600">页面描述</p>
                </div>

                {/* 页面内容区 */}
                <div className="space-y-2">{/* 内容组件 */}</div>
            </section>
        </>
    );
}
```

#### 布局继承说明

- **导航栏**: layout.tsx中的Navbar自动包含，页面无需处理
- **页面间距**: layout.tsx中的main元素已统一设置 `px-4 py-4`
- **页面滚动**: layout.tsx处理overflow，页面内容自动滚动
- **页面组件职责**: 仅处理页面内容结构，不处理容器和外层间距

#### 导航集成

- **全局导航**: layout.tsx中已包含Navbar，所有页面自动继承
- **页面导航**: 不需要单独添加导航组件
- **页面标题**: 使用统一的标题样式 `text-xl font-bold mb-2`

### 代码质量

- 使用TypeScript严格模式
- 组件使用函数式写法
- 遵循React Hooks最佳实践

## 注意事项

- 永远不要使用npm，只使用bun
- 优先使用Lucide React图标库
- 专注于手机端体验，充分利用屏幕宽度
- 保持中文界面的一致性
- 遵循无障碍访问性 (a11y) 标准
- 不使用响应式断点，保持固定手机端布局
- 如果 heroui 有， 不要使用自己写的组件， 完全使用 heroui 自带

## 常用命令

### 开发与构建

```bash
# 开发服务器 (使用 Turbopack)
bun run dev

# 生产构建 (会自动运行 lint 和 prisma generate)
bun run build

# 启动生产服务器 (端口 13000)
bun run start

# 代码检查与自动修复
bun run lint

# 安装依赖
bun add <package-name>
```

### 数据库管理

```bash
# 生成 Prisma Client
bun run db:generate

# 推送 schema 变更到数据库 (无需迁移文件)
bun run db:push

# 打开 Prisma Studio (数据库可视化工具)
bun run db:studio
```

### 数据库管理脚本

```bash
# 用户管理
bun run add-user          # 添加新用户
bun run list-users        # 列出所有用户
bun run reset-password    # 重置用户密码

# 数据备份与恢复
bun run backup            # 备份数据库
bun run restore           # 恢复数据库

# 数据迁移工具
bun run fix-covers        # 修复餐厅封面图
bun run migrate-images    # 迁移图片 URL
```

## 核心架构

### 目录结构

```
/
├── app/
│   ├── (main)/              # 主应用路由组 (带导航栏和页脚)
│   │   ├── layout.tsx       # 统一布局 (Navbar + Footer + 全局间距)
│   │   ├── page.tsx         # 首页
│   │   ├── food/            # 美食页面
│   │   ├── activity/        # 活动页面
│   │   ├── jobs/            # 兼职页面
│   │   └── ...              # 其他功能页面
│   ├── (admin)/             # 管理后台路由组
│   │   └── admin/           # 管理页面
│   ├── api/                 # API 路由
│   │   ├── users/           # 用户相关 API
│   │   ├── admin/           # 管理员 API (需要认证)
│   │   ├── restaurants/     # 餐厅 API
│   │   ├── parttime/        # 兼职 API
│   │   ├── activity/        # 活动 API
│   │   └── upload/          # 文件上传 API
│   └── sw.ts                # Service Worker 配置
├── components/              # React 组件
│   ├── navbar.tsx           # 全局导航栏
│   ├── footer.tsx           # 全局页脚
│   └── ...
├── lib/                     # 核心工具库
│   ├── db.ts                # Prisma 数据库实例
│   ├── jwt.ts               # JWT 工具类 (生成/验证 token)
│   ├── auth.ts              # 认证中间件 (authenticateRequest/requireAuth/requireAdmin)
│   ├── response.ts          # API 响应工具
│   └── search-utils.ts      # 搜索工具 (支持拼音搜索)
├── services/                # 前端服务层
│   ├── api-client.ts        # HTTP 客户端 (统一请求封装)
│   ├── api.ts               # API 调用封装
│   └── admin.ts             # 管理员相关 API
├── types/                   # TypeScript 类型定义
├── config/                  # 配置文件
│   ├── site.ts              # 站点配置 (导航菜单等)
│   └── fonts.ts             # 字体配置
├── scripts/                 # 管理脚本
├── prisma/
│   └── schema.prisma        # 数据库模型定义
└── public/                  # 静态资源
```

### API 认证架构

项目使用 JWT 进行认证，认证流程：

1. **登录**: `POST /api/users/login` 返回 JWT token
2. **前端存储**: token 存储在 `localStorage.auth_token`
3. **请求认证**: 通过 `Authorization: Bearer <token>` 头传递
4. **服务端验证**: 使用 [lib/auth.ts](lib/auth.ts) 中的认证中间件

#### 认证中间件使用

```typescript
// lib/auth.ts 提供三个认证函数
import { authenticateRequest, requireAuth, requireAdmin } from '@/lib/auth';

// 1. authenticateRequest - 可选认证 (返回 null 或用户信息)
const user = await authenticateRequest(request);

// 2. requireAuth - 必需认证 (未登录抛出 UNAUTHORIZED)
const user = await requireAuth(request);

// 3. requireAdmin - 必需管理员 (非管理员抛出 FORBIDDEN)
const admin = await requireAdmin(request);
```

### 数据库模型

主要模型 (详见 [prisma/schema.prisma](prisma/schema.prisma)):

- **User**: 用户表 (包含学生信息)
- **Restaurant**: 餐厅表 (包含位置、类型、标签等)
- **Parttime**: 兼职信息表
- **Activity**: 活动表

### PWA 配置

- Service Worker 使用 Serwist 管理
- 配置文件: [app/sw.ts](app/sw.ts)
- 构建配置: [next.config.js](next.config.js)
- 开发环境下 SW 功能被禁用
- 排除大文件 (图片、视频) 避免过度缓存

### TypeScript 路径别名

项目使用 `@/*` 作为根目录别名:

```typescript
import { db } from '@/lib/db';
import { Navbar } from '@/components/navbar';
import { siteConfig } from '@/config/site';
```

## 环境变量

项目需要在 `.env` 文件中配置以下变量:

```bash
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/hubu"

# JWT 配置
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# API 基础 URL (可选)
NEXT_PUBLIC_API_BASE_URL=""
```

---

最后更新: 2025-01-17
