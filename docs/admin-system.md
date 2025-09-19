# 湖大萧云 - 后台管理系统

## 系统概述

湖大萧云后台管理系统是一个基于 Next.js 和 HeroUI 的现代化管理界面，专门用于管理兼职和餐厅信息。系统采用 DRY（Don't Repeat Yourself）原则设计，具有完善的权限控制和用户友好的操作界面。

## 技术架构

### 前端架构

- **框架**: Next.js 15 (App Router)
- **UI组件库**: HeroUI (基于React Aria)
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks
- **HTTP客户端**: 原生 fetch API 封装

### 后端架构

- **框架**: 基于装饰器的 TypeScript 框架
- **Web服务**: Hono
- **数据库**: Prisma ORM
- **认证**: JWT Token
- **权限控制**: 基于角色的访问控制 (RBAC)

## 核心功能

### 1. 权限管理系统

- **管理员身份验证**: JWT Token 验证
- **权限保护**: 页面级和组件级权限控制
- **自动权限检查**: 使用 `useAdmin` Hook 自动验证管理员状态
- **权限守护**: `AdminGuard` 组件保护管理员专用内容

### 2. 兼职信息管理

- **CRUD 操作**: 创建、读取、更新、删除兼职信息
- **搜索功能**: 支持按职位名称、描述、地点搜索
- **分类筛选**: 按工作类型筛选
- **标签管理**: 支持多标签分类
- **分页显示**: 高效的分页数据加载

### 3. 餐厅信息管理

- **完整的餐厅信息**: 名称、地址、电话、描述、图片等
- **地理位置**: 经纬度坐标存储和显示
- **评分系统**: 餐厅评分管理
- **图片预览**: 封面图片和预览图片管理
- **营业时间**: 餐厅营业时间管理

### 4. 数据统计仪表盘

- **系统概览**: 用户统计、餐厅数量、兼职数量
- **实时数据**: 动态加载最新统计信息
- **可视化展示**: 图表和进度条显示数据分布
- **快捷操作**: 直接跳转到各管理模块

## 目录结构

```
app/admin/                    # 管理后台路由
├── layout.tsx               # 管理后台布局
├── page.tsx                 # 仪表盘页面
├── parttime/
│   └── page.tsx            # 兼职管理页面
├── restaurant/
│   └── page.tsx            # 餐厅管理页面
├── users/
│   └── page.tsx            # 用户管理页面
└── settings/
    └── page.tsx            # 系统设置页面

components/common/            # 通用组件
├── admin-guard.tsx          # 权限保护组件
├── data-table.tsx           # 通用数据表格
└── data-form.tsx            # 通用数据表单

hooks/
└── use-admin.ts            # 管理员权限Hook

services/
├── api-client.ts           # API客户端封装
└── admin.ts                # 管理员服务接口

backend/src/controllers/
└── admin.ts                # 后端管理员控制器
```

## 核心组件详解

### AdminGuard 权限保护组件

```typescript
// 使用示例
<AdminGuard>
  <AdminContent />
</AdminGuard>
```

- 自动检查用户管理员权限
- 显示加载状态和错误信息
- 非管理员用户显示访问拒绝界面

### DataTable 通用数据表格

- **功能**: 数据展示、搜索、筛选、分页、CRUD操作
- **特性**: 高度可配置，支持自定义列渲染
- **复用性**: 可用于任何数据类型的管理界面

### DataForm 通用数据表单

- **字段类型**: text、email、number、textarea、select、tags等
- **验证功能**: 必填、格式、范围验证
- **动态表单**: 根据配置动态生成表单界面

### useAdmin Hook

```typescript
const { isAdmin, user, loading, error, checkAdminStatus, logout } = useAdmin();
```

- 管理员状态管理
- 自动权限检查
- 错误处理和重试机制

## API 接口

### 管理员权限接口

```
GET  /api/admin/check         # 检查管理员权限
GET  /api/admin/stats         # 获取统计数据
POST /api/admin/promote-user  # 提升用户为管理员
POST /api/admin/demote-admin  # 撤销管理员权限
```

### 兼职管理接口

```
GET    /api/admin/parttime     # 获取兼职列表
POST   /api/admin/parttime     # 创建兼职
PUT    /api/admin/parttime/:id # 更新兼职
DELETE /api/admin/parttime/:id # 删除兼职
```

### 餐厅管理接口

```
GET    /api/admin/restaurant     # 获取餐厅列表
POST   /api/admin/restaurant     # 创建餐厅
PUT    /api/admin/restaurant/:id # 更新餐厅
DELETE /api/admin/restaurant/:id # 删除餐厅
```

## 权限控制机制

### 1. 后端权限验证

- **JWT Token**: 基于 JWT 的用户身份认证
- **@RequireAdmin 装饰器**: 接口级权限控制
- **角色检查**: 验证用户角色为 'ADMIN'

### 2. 前端权限保护

- **路由保护**: 通过 AdminGuard 组件保护管理页面
- **组件级保护**: 管理员专用组件自动隐藏
- **状态管理**: useAdmin Hook 统一管理权限状态

## 数据流架构

```
用户操作 → 前端组件 → Service层 → API客户端 → 后端控制器 → 数据库
        ↑                                                    ↓
        权限验证 ← JWT验证 ← @RequireAdmin装饰器 ← 权限中间件
```

## DRY 原则实践

### 1. 组件复用

- **DataTable**: 统一的数据表格组件，减少重复代码
- **DataForm**: 通用表单组件，支持多种字段类型
- **AdminGuard**: 权限保护逻辑封装

### 2. 服务层抽象

- **ApiClient**: 统一的HTTP请求封装
- **AdminService**: 管理员相关接口统一管理
- **错误处理**: 统一的错误处理机制

### 3. 类型定义

- **TypeScript 接口**: 统一的数据类型定义
- **泛型组件**: 提高组件的复用性
- **类型安全**: 编译时类型检查

## 安全特性

### 1. 身份认证

- JWT Token 认证
- Token 自动过期处理
- 安全的Token存储

### 2. 权限控制

- 基于角色的访问控制
- 接口级权限验证
- 前端权限保护

### 3. 数据验证

- 输入参数验证
- SQL注入防护
- XSS攻击防护

## 用户体验

### 1. 响应式设计

- 移动端适配
- 侧边栏自适应
- 触摸友好的操作界面

### 2. 加载状态

- 骨架屏加载效果
- 异步操作反馈
- 错误状态处理

### 3. 操作反馈

- 成功/失败消息提示
- 确认对话框
- 实时数据更新

## 部署说明

### 前端部署

1. 构建项目: `bun run build`
2. 启动服务: `bun run start`
3. 环境变量配置: `NEXT_PUBLIC_API_BASE_URL`

### 后端部署

1. 生成Prisma客户端: `bun run db:generate`
2. 启动后端服务: `bun run dev`

## 未来扩展

### 计划功能

1. **用户管理**: 完整的用户列表和权限管理
2. **系统设置**: 系统配置和主题设置
3. **数据导出**: Excel/CSV格式数据导出
4. **操作日志**: 管理员操作记录和审计
5. **批量操作**: 批量数据导入和管理

### 技术优化

1. **缓存策略**: Redis缓存提升性能
2. **搜索优化**: 全文搜索功能
3. **图片管理**: 图片上传和CDN集成
4. **实时通信**: WebSocket实时数据更新

---

本文档描述了湖大萧云后台管理系统的完整架构和实现细节。系统遵循现代Web开发最佳实践，提供了安全、高效、易用的管理界面。
