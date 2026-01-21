# 🤝 贡献指南

感谢你对这个项目的兴趣！我们欢迎各种形式的贡献。

## 📝 如何贡献

### 报告 Bug

如果你发现了 bug，请：

1. 检查 [Issues](https://github.com/Besta0/blogkk/issues) 确认该 bug 尚未被报告
2. 创建一个新的 Issue，包含：
   - 清晰的标题和描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 截图（如适用）
   - 环境信息（浏览器、操作系统等）

### 提出功能建议

1. 检查现有 Issues 确认该功能尚未被建议
2. 创建 Issue 描述你的想法：
   - 功能的目的和用途
   - 可能的实现方式
   - 相关的截图或示例

### 提交代码

1. **Fork 仓库**
   ```bash
   git clone https://github.com/Besta0/blogkk.git
   cd blogkk
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **进行修改**
   - 编写代码
   - 确保代码符合项目规范
   - 添加必要的注释

5. **测试**
   ```bash
   npm run dev  # 确保应用正常运行
   npm run build  # 确保构建成功
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

7. **推送并创建 Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   然后在 GitHub 上创建 Pull Request

## 📋 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更改
- `style:` 代码格式（不影响代码运行）
- `refactor:` 重构（既不是新功能也不是 bug 修复）
- `perf:` 性能优化
- `test:` 添加或修改测试
- `chore:` 构建过程或辅助工具的变动

示例：
```
feat: 添加深色模式切换功能
fix: 修复移动端导航栏显示问题
docs: 更新部署文档
```

## 🎨 代码规范

### TypeScript

- 使用 TypeScript 严格模式
- 为所有函数和组件添加类型定义
- 避免使用 `any`，优先使用具体类型或 `unknown`

### React

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 接口命名：`ComponentNameProps`
- 保持组件小而专注

### 样式

- 使用 Tailwind CSS 类名
- 避免内联样式（除非必要）
- 保持响应式设计

### 文件命名

- 组件文件：`PascalCase.tsx`
- 工具文件：`camelCase.ts`
- 常量文件：`UPPER_SNAKE_CASE.ts`

## 🧪 测试

在提交 PR 之前，请确保：

- [ ] 代码可以正常构建 (`npm run build`)
- [ ] 没有 TypeScript 错误
- [ ] 没有 ESLint 警告
- [ ] 在不同浏览器中测试（Chrome、Firefox、Safari）
- [ ] 在移动设备上测试响应式设计

## 📚 项目结构

```
src/
├── components/     # React 组件
├── App.tsx         # 主应用
├── main.tsx        # 入口文件
└── index.css       # 全局样式
```

## ❓ 问题？

如果你有任何问题，可以：

- 创建 Issue 询问
- 查看现有文档
- 联系维护者

## 🙏 感谢

感谢你的贡献，让这个项目变得更好！

---

**注意**：所有贡献者都需要遵守 [行为准则](CODE_OF_CONDUCT.md)（如果存在）。
