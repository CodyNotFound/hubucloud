# 湖大萧云项目 - Claude AI 指导文档

## 项目概述

这是一个为湖北大学学生服务的校园生活平台，提供论坛、活动、快递、跳蚤市场、失物招领、兼职等服务。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI库**: HeroUI (基于React Aria)
- **样式**: Tailwind CSS
- **图标**: Lucide React (优先使用)
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
        <div className="space-y-2">
          {/* 内容组件 */}
        </div>
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
- 代码格式化使用项目内置的ESLint配置

## 注意事项

- 永远不要使用npm，只使用bun
- 优先使用Lucide React图标库
- 专注于手机端体验，充分利用屏幕宽度
- 保持中文界面的一致性
- 遵循无障碍访问性 (a11y) 标准
- 不使用响应式断点，保持固定手机端布局

## 常用命令

```bash
# 开发
bun run dev

# 构建
bun run build

# 代码检查
bun run lint

# 安装依赖
bun add <package-name>
```

---

最后更新: 2025-01-11
