# 管理员工具脚本

这些脚本提供了直接的数据库操作功能，用于用户管理。

## 脚本列表

### 1. 创建用户 (`create-user.ts`)

创建新用户账户。

```bash
# 创建普通用户
bun run scripts/create-user.ts username password

# 创建管理员用户
bun run scripts/create-user.ts admin123 password123 ADMIN

# 创建普通用户（显式指定角色）
bun run scripts/create-user.ts user123 password123 USER
```

**参数说明:**

- `username`: 用户名（3-30个字符）
- `password`: 密码（至少6个字符）
- `role`: 用户角色（可选，默认为USER，可选值：USER、ADMIN）

### 2. 重设密码 (`reset-password.ts`)

重设指定用户的密码。

```bash
bun run scripts/reset-password.ts username new_password
```

**参数说明:**

- `username`: 要重设密码的用户名
- `new_password`: 新密码（至少6个字符）

### 3. 管理用户权限 (`manage-role.ts`)

提升或降级用户权限。

```bash
# 显示用户当前角色
bun run scripts/manage-role.ts username show

# 提升用户为管理员
bun run scripts/manage-role.ts username promote

# 降级管理员为普通用户
bun run scripts/manage-role.ts username demote
```

**操作说明:**

- `show`: 显示用户当前角色信息
- `promote`: 将普通用户提升为管理员
- `demote`: 将管理员降级为普通用户（不能降级最后一个管理员）

### 4. 列出用户 (`list-users.ts`)

查看系统中的所有用户。

```bash
# 列出所有用户
bun run scripts/list-users.ts

# 只列出管理员
bun run scripts/list-users.ts ADMIN

# 只列出普通用户
bun run scripts/list-users.ts USER
```

**筛选参数:**

- `ALL`: 显示所有用户（默认）
- `ADMIN`: 只显示管理员
- `USER`: 只显示普通用户

## 使用前提

1. 确保后端服务器已安装依赖：

    ```bash
    cd backend
    bun install
    ```

2. 确保数据库已经配置并可连接

3. 从 `backend` 目录运行脚本

## 安全注意事项

⚠️ **重要提醒:**

1. 这些脚本直接操作数据库，请谨慎使用
2. 建议在生产环境使用前先在测试环境验证
3. 密码会以SHA256方式加密存储
4. 系统至少需要保留一个管理员账户
5. 建议定期备份数据库

## 示例工作流程

### 初始设置管理员

```bash
# 1. 创建第一个管理员
bun run scripts/create-user.ts admin admin123456 ADMIN

# 2. 确认管理员创建成功
bun run scripts/list-users.ts ADMIN
```

### 日常用户管理

```bash
# 1. 创建普通用户
bun run scripts/create-user.ts student001 password123

# 2. 查看所有用户
bun run scripts/list-users.ts

# 3. 提升用户为管理员
bun run scripts/manage-role.ts student001 promote

# 4. 重设用户密码
bun run scripts/reset-password.ts student001 newpassword456
```

## 故障排除

如果遇到数据库连接问题，请检查：

1. 数据库服务是否正在运行
2. 环境变量 `DATABASE_URL` 是否正确配置
3. 数据库权限是否足够

如果遇到权限问题，请确保：

1. 当前用户有读写数据库的权限
2. 脚本文件有执行权限
