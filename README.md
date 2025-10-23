# 湖大萧云

校园生活服务平台，基于 Next.js 15 + HeroUI v2 + Prisma + PostgreSQL 构建。

## 快速开始

### 安装依赖

```bash
bun install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
```

### 初始化数据库

```bash
bun db:push
```

### 启动开发服务器

```bash
bun dev
```

访问 http://localhost:3000

## 生产部署

### 构建

```bash
bun run build
```

### 启动生产服务器

```bash
bun start
```

默认端口为 13000。

### 使用 PM2

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

## 数据库管理

### 备份数据库

```bash
bun backup
```

### 恢复数据库

```bash
bun restore
```

## 用户管理

### 添加用户

```bash
bun add-user
```

### 重置密码

```bash
bun reset-password
```

### 查看所有用户

```bash
bun list-users
```

## 维护脚本

```bash
# 清理未使用的图片
bun clean-images

# 修复餐厅封面图
bun fix-covers

# 迁移图片 URL
bun migrate-images
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: HeroUI v2, Tailwind CSS
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT
- **PWA**: @serwist/next
- **部署**: PM2

## 许可证

MIT
