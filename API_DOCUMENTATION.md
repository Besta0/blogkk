# 📚 API 文档

动态作品集网站后端 API 完整文档。

## 目录

- [概述](#概述)
- [认证](#认证)
- [API 端点](#api-端点)
  - [健康检查](#健康检查)
  - [认证接口](#认证接口)
  - [个人资料](#个人资料)
  - [项目管理](#项目管理)
  - [博客系统](#博客系统)
  - [联系消息](#联系消息)
  - [邮件订阅](#邮件订阅)
  - [文件上传](#文件上传)
  - [数据分析](#数据分析)
- [错误处理](#错误处理)
- [速率限制](#速率限制)

## 概述

### 基础信息

- **Base URL**: `http://localhost:3020/api` (生产环境) / `http://localhost:3010/api` (开发环境)
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>  # 需要认证的接口
```

### 响应格式

#### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

#### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 认证

### JWT 认证流程

1. 使用邮箱和密码调用 `/api/auth/login` 获取令牌
2. 在后续请求的 `Authorization` 头中携带访问令牌
3. 访问令牌过期后，使用刷新令牌获取新的访问令牌
4. 登出时调用 `/api/auth/logout` 撤销刷新令牌

### 令牌类型

| 类型 | 有效期 | 用途 |
|------|--------|------|
| Access Token | 1 小时 | API 请求认证 |
| Refresh Token | 7 天 | 刷新访问令牌 |

### 权限级别

| 级别 | 描述 |
|------|------|
| Public | 无需认证 |
| User | 需要有效的访问令牌 |
| Admin | 需要管理员权限 |

---

## API 端点

### 健康检查

#### GET /health

检查服务器运行状态。

**权限**: Public

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

---

### 认证接口

#### POST /api/auth/login

用户登录，获取 JWT 令牌。

**权限**: Public  
**速率限制**: 5 次/15 分钟

**请求体**:
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

#### POST /api/auth/refresh

刷新访问令牌。

**权限**: Public  
**速率限制**: 5 次/15 分钟

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/auth/logout

登出并撤销刷新令牌。

**权限**: Public

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/forgot-password

请求密码重置邮件。

**权限**: Public  
**速率限制**: 5 次/15 分钟

**请求体**:
```json
{
  "email": "admin@example.com"
}
```

#### POST /api/auth/reset-password

使用重置令牌重置密码。

**权限**: Public  
**速率限制**: 5 次/15 分钟

**请求体**:
```json
{
  "token": "reset-token-from-email",
  "password": "new-password",
  "confirmPassword": "new-password"
}
```

#### GET /api/auth/verify-reset-token/:token

验证密码重置令牌是否有效。

**权限**: Public

---

### 个人资料

#### GET /api/profile

获取公开的个人资料信息。

**权限**: Public

**响应**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "张三",
    "title": "全栈开发工程师",
    "bio": "热爱编程的开发者...",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "skills": ["React", "TypeScript", "Node.js"],
    "experience": [
      {
        "company": "科技公司",
        "position": "高级工程师",
        "startDate": "2020-01-01",
        "endDate": null,
        "description": "负责前端架构...",
        "current": true
      }
    ],
    "social": {
      "github": "https://github.com/username",
      "linkedin": "https://linkedin.com/in/username",
      "email": "contact@example.com"
    }
  }
}
```

#### PUT /api/profile

更新个人资料 (完整更新)。

**权限**: Admin

**请求体**:
```json
{
  "name": "张三",
  "title": "全栈开发工程师",
  "bio": "热爱编程的开发者...",
  "avatar": "https://cloudinary.com/avatar.jpg",
  "skills": ["React", "TypeScript", "Node.js"],
  "experience": [...],
  "social": {...}
}
```

#### PATCH /api/profile

部分更新个人资料。

**权限**: Admin

**请求体** (只需包含要更新的字段):
```json
{
  "title": "资深全栈工程师",
  "skills": ["React", "TypeScript", "Node.js", "Go"]
}
```

---

### 项目管理

#### GET /api/projects

获取项目列表，支持分页、筛选和搜索。

**权限**: Public

**查询参数**:
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 10 | 每页数量 (最大 100) |
| technology | string | - | 按技术筛选 |
| featured | boolean | - | 筛选精选项目 |
| search | string | - | 搜索标题、描述、技术 |
| sortBy | string | createdAt | 排序字段 |
| sortOrder | string | desc | 排序方向 (asc/desc) |

**响应**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "电商平台",
        "description": "全栈电商解决方案...",
        "technologies": ["React", "Node.js", "MongoDB"],
        "images": ["https://cloudinary.com/project1.jpg"],
        "githubUrl": "https://github.com/user/project",
        "liveUrl": "https://project.example.com",
        "featured": true,
        "likes": 42,
        "views": 1234,
        "shares": 15,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

#### GET /api/projects/featured

获取精选项目列表。

**权限**: Public

#### GET /api/projects/technologies

获取所有项目使用的技术列表。

**权限**: Public

**响应**:
```json
{
  "success": true,
  "data": ["React", "TypeScript", "Node.js", "MongoDB", "Docker"]
}
```

#### GET /api/projects/:id

获取单个项目详情。

**权限**: Public

#### POST /api/projects

创建新项目。

**权限**: Admin

**请求体**:
```json
{
  "title": "新项目",
  "description": "项目描述...",
  "technologies": ["React", "Node.js"],
  "images": ["https://cloudinary.com/image.jpg"],
  "githubUrl": "https://github.com/user/project",
  "liveUrl": "https://project.example.com",
  "featured": false
}
```

#### PUT /api/projects/:id

更新项目。

**权限**: Admin

#### DELETE /api/projects/:id

删除项目。

**权限**: Admin

#### POST /api/projects/:id/like

为项目点赞。

**权限**: Public

#### POST /api/projects/:id/share

记录项目分享。

**权限**: Public

---

### 博客系统

#### GET /api/blog/posts/published

获取已发布的博客文章列表。

**权限**: Public

**查询参数**:
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 10 | 每页数量 |
| tag | string | - | 按标签筛选 |
| search | string | - | 搜索标题、内容 |
| sortBy | string | publishedAt | 排序字段 |
| sortOrder | string | desc | 排序方向 |

#### GET /api/blog/posts/recent

获取最近发布的文章。

**权限**: Public

**查询参数**:
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| limit | number | 5 | 返回数量 (最大 20) |

#### GET /api/blog/posts/slug/:slug

通过 slug 获取文章详情。

**权限**: Public

**响应**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "如何构建现代 Web 应用",
    "slug": "how-to-build-modern-web-app",
    "content": "# 文章内容\n\nMarkdown 格式...",
    "excerpt": "文章摘要...",
    "tags": ["React", "TypeScript", "教程"],
    "published": true,
    "featuredImage": "https://cloudinary.com/blog.jpg",
    "views": 567,
    "readTime": 8,
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/blog/tags

获取所有博客标签。

**权限**: Public

#### GET /api/blog/posts

获取所有文章 (包括未发布)。

**权限**: Admin

#### GET /api/blog/posts/:id

通过 ID 获取文章。

**权限**: Admin

#### POST /api/blog/posts

创建新文章。

**权限**: Admin

**请求体**:
```json
{
  "title": "文章标题",
  "content": "# Markdown 内容...",
  "excerpt": "文章摘要",
  "tags": ["标签1", "标签2"],
  "published": false,
  "featuredImage": "https://cloudinary.com/image.jpg"
}
```

#### PUT /api/blog/posts/:id

更新文章。

**权限**: Admin

#### DELETE /api/blog/posts/:id

删除文章。

**权限**: Admin

---

### 联系消息

#### POST /api/contact

提交联系消息。

**权限**: Public  
**速率限制**: 5 次/小时

**请求体**:
```json
{
  "name": "访客姓名",
  "email": "visitor@example.com",
  "subject": "咨询主题",
  "message": "消息内容..."
}
```

#### GET /api/contact

获取所有联系消息。

**权限**: Admin

**查询参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| page | number | 页码 |
| limit | number | 每页数量 |
| read | boolean | 筛选已读/未读 |

#### GET /api/contact/:id

获取单条消息详情。

**权限**: Admin

#### PATCH /api/contact/:id/read

标记消息为已读。

**权限**: Admin

#### PATCH /api/contact/:id/replied

标记消息为已回复。

**权限**: Admin

#### DELETE /api/contact/:id

删除消息。

**权限**: Admin

---

### 邮件订阅

#### POST /api/newsletter/subscribe

订阅邮件通知。

**权限**: Public  
**速率限制**: 10 次/小时

**请求体**:
```json
{
  "email": "subscriber@example.com"
}
```

#### POST /api/newsletter/unsubscribe

取消订阅。

**权限**: Public

**请求体**:
```json
{
  "email": "subscriber@example.com"
}
```

#### GET /api/newsletter/subscribers

获取订阅者列表。

**权限**: Admin

#### GET /api/newsletter/count

获取订阅者数量。

**权限**: Admin

---

### 文件上传

#### GET /api/upload/status

获取上传服务状态。

**权限**: Public

#### POST /api/upload/image

上传单张图片。

**权限**: Admin  
**速率限制**: 20 次/小时

**请求**: `multipart/form-data`
| 字段 | 类型 | 描述 |
|------|------|------|
| image | File | 图片文件 (最大 5MB) |

**支持格式**: JPEG, PNG, GIF, WebP

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "portfolio/abc123",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "bytes": 245678
  }
}
```

#### POST /api/upload/profile

上传头像图片 (自动优化为头像尺寸)。

**权限**: Admin

#### POST /api/upload/project

上传项目图片。

**权限**: Admin

#### POST /api/upload/blog

上传博客配图。

**权限**: Admin

#### POST /api/upload/images

批量上传图片 (最多 5 张)。

**权限**: Admin

**请求**: `multipart/form-data`
| 字段 | 类型 | 描述 |
|------|------|------|
| images | File[] | 图片文件数组 |

#### DELETE /api/upload/image/:publicId

删除已上传的图片。

**权限**: Admin

---

### 数据分析

#### POST /api/analytics/view

记录页面访问。

**权限**: Public

**请求体**:
```json
{
  "page": "/projects",
  "referrer": "https://google.com"
}
```

#### POST /api/analytics/interaction

记录用户交互。

**权限**: Public

**请求体**:
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "type": "view"
}
```

#### GET /api/analytics/stats

获取统计概览。

**权限**: Admin

#### GET /api/analytics/summary

获取统计摘要。

**权限**: Admin

**响应**:
```json
{
  "success": true,
  "data": {
    "pageViews": {
      "totalViews": 12345,
      "uniqueVisitors": 5678,
      "topPages": [
        { "page": "/", "views": 5000 },
        { "page": "/projects", "views": 3000 }
      ]
    },
    "projectStats": [
      {
        "projectId": "...",
        "title": "项目名称",
        "views": 1234,
        "likes": 56,
        "shares": 12
      }
    ],
    "realTime": {
      "viewsLast24h": 234,
      "viewsLast7d": 1567
    }
  }
}
```

#### GET /api/analytics/projects

获取项目统计数据。

**权限**: Admin

#### GET /api/analytics/views

获取最近访问记录。

**权限**: Admin

#### GET /api/analytics/realtime

获取实时统计数据。

**权限**: Admin

#### GET /api/analytics/behavior

获取用户行为分析。

**权限**: Admin

#### GET /api/analytics/trends

获取交互趋势数据。

**权限**: Admin

#### GET /api/analytics/export/pageviews

导出页面访问数据 (CSV)。

**权限**: Admin

#### GET /api/analytics/export/interactions

导出交互数据 (CSV)。

**权限**: Admin

---

## 错误处理

### HTTP 状态码

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 422 | 数据验证失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 错误码

| 错误码 | 描述 |
|--------|------|
| VALIDATION_ERROR | 数据验证失败 |
| AUTHENTICATION_ERROR | 认证失败 |
| AUTHORIZATION_ERROR | 权限不足 |
| NOT_FOUND | 资源不存在 |
| DUPLICATE_ERROR | 资源已存在 |
| RATE_LIMIT_ERROR | 超出速率限制 |
| INTERNAL_ERROR | 服务器内部错误 |

---

## 速率限制

| 端点类型 | 限制 |
|----------|------|
| 认证接口 | 5 次/15 分钟 |
| 联系表单 | 5 次/小时 |
| 邮件订阅 | 10 次/小时 |
| 文件上传 | 20 次/小时 |
| 一般 API | 100 次/分钟 |

超出限制时返回 `429 Too Many Requests`。

---

## 示例代码

### JavaScript/TypeScript

```typescript
// 登录
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// 获取项目列表
const getProjects = async (token: string) => {
  const response = await fetch('/api/projects?page=1&limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// 上传图片
const uploadImage = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3020/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 获取项目列表
curl http://localhost:3020/api/projects?page=1&limit=10

# 创建项目 (需要认证)
curl -X POST http://localhost:3020/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"新项目","description":"描述","technologies":["React"]}'
```

---

如有问题，请参考 [部署指南](./DEPLOYMENT.md) 或提交 Issue。
