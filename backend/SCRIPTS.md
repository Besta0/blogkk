# 后端脚本使用指南

本文档说明后端各种管理脚本的用途和使用方法。

## 📋 脚本列表

### 1. 初始化管理员账号 (`init:admin`)

**用途**: 创建管理员账号

**使用场景**: 
- 首次部署时创建管理员
- 重置管理员密码

**命令**:
```bash
# 使用默认凭据 (admin@example.com / admin123)
npm run init:admin

# 使用自定义凭据
npm run init:admin your-email@example.com your-password
```

**环境**: ✅ 开发环境 | ✅ 生产环境

**安全性**: 安全 - 只创建管理员账号，不会覆盖现有数据

---

### 2. 填充测试数据 (`seed`)

**用途**: 向数据库填充测试数据（用户、项目、博客文章等）

**使用场景**:
- 开发环境初始化
- 演示环境准备
- 测试数据准备

**命令**:
```bash
# 开发环境（自动允许）
npm run seed
```

**环境**: ✅ 开发环境 | ❌ 生产环境（默认禁止）

**安全性**: 
- ⚠️ **开发环境**: 自动允许运行
- 🚫 **生产环境**: 默认禁止，需要明确设置 `ALLOW_SEEDING=true`

**生产环境强制运行**:
```bash
# ⚠️ 警告：这会向生产数据库添加测试数据！
npm run seed:prod
```

**包含的测试数据**:
- 1个管理员账号 (admin@example.com / admin123)
- 1个示例个人资料
- 7个示例项目
- 7篇示例博客文章
- 分析数据（页面访问、项目交互、系统日志）

---

### 3. 设置数据库索引 (`setup-indexes`)

**用途**: 为MongoDB集合创建索引以优化查询性能

**使用场景**:
- 首次部署后
- 数据库迁移后
- 性能优化

**命令**:
```bash
npm run setup-indexes
```

**环境**: ✅ 开发环境 | ✅ 生产环境

**安全性**: 安全 - 只创建索引，不修改数据

---

### 4. 检查数据一致性 (`check-consistency`)

**用途**: 检查MySQL和MongoDB之间的数据一致性

**使用场景**:
- 定期数据审计
- 故障排查
- 数据迁移后验证

**命令**:
```bash
npm run check-consistency
```

**环境**: ✅ 开发环境 | ✅ 生产环境

**安全性**: 安全 - 只读操作，不修改数据

---

### 5. 数据迁移 (`migrate`)

**用途**: 从MongoDB迁移数据到MySQL（用于数据库架构升级）

**使用场景**:
- 从纯MongoDB架构迁移到混合架构
- 数据库重构

**命令**:
```bash
npm run migrate
```

**环境**: ✅ 开发环境 | ⚠️ 生产环境（谨慎使用）

**安全性**: ⚠️ 中等风险 - 会修改数据库结构，建议先备份

---

## 🔒 安全最佳实践

### 开发环境

1. **自由使用所有脚本** - 开发环境可以随意运行任何脚本
2. **定期重置数据** - 使用 `seed` 脚本重置测试数据
3. **测试迁移脚本** - 在开发环境测试所有数据库操作

### 生产环境

1. **谨慎运行脚本** - 只运行必要的脚本
2. **备份优先** - 运行任何修改数据的脚本前先备份
3. **避免seed脚本** - 永远不要在生产环境运行 `seed` 脚本
4. **使用init:admin** - 只使用 `init:admin` 创建管理员
5. **定期检查一致性** - 使用 `check-consistency` 监控数据健康

---

## 📝 脚本执行顺序

### 首次部署（开发环境）

```bash
# 1. 创建管理员账号
npm run init:admin

# 2. 设置数据库索引
npm run setup-indexes

# 3. 填充测试数据（可选）
npm run seed
```

### 首次部署（生产环境）

```bash
# 1. 创建管理员账号
npm run init:admin your-email@example.com secure-password

# 2. 设置数据库索引
npm run setup-indexes

# 3. 检查数据一致性
npm run check-consistency
```

### 定期维护

```bash
# 检查数据一致性（每周）
npm run check-consistency

# 备份数据库（每天）
# 使用数据库自带的备份工具
```

---

## ⚠️ 常见问题

### Q: seed脚本在生产环境被阻止了？

A: 这是正常的安全保护。如果确实需要在生产环境运行（不推荐），使用：
```bash
npm run seed:prod
```

### Q: 如何重置开发环境数据？

A: 删除数据库并重新运行seed脚本：
```bash
# 删除MySQL数据
docker-compose exec mysql mysql -u root -p -e "DROP DATABASE portfolio_dev; CREATE DATABASE portfolio_dev;"

# 重新填充数据
npm run seed
```

### Q: init:admin说用户已存在？

A: 如果需要重置密码，先删除现有用户或使用密码重置功能。

### Q: 脚本运行失败怎么办？

A: 检查以下几点：
1. 数据库连接是否正常
2. 环境变量是否正确配置
3. 查看完整的错误日志
4. 确保数据库表已创建

---

## 🔗 相关文档

- [数据库设置指南](./DATABASE_SETUP.md)
- [部署指南](../DEPLOYMENT.md)
- [环境变量配置](../ENV_CONFIGURATION.md)
- [管理员手册](../ADMIN_MANUAL.md)
