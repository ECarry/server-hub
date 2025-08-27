# Better-Auth + tRPC 权限控制系统使用指南

## 📋 权限矩阵

| 角色 | 创建 | 更新 | 删除 | 发布 | 查看Public | 查看Private | 查看Draft |
|------|------|------|------|------|------------|-------------|-----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pro** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **User** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

## 🔧 核心组件

### 1. 权限系统 (`/src/lib/permissions.ts`)
```typescript
// 权限检查
canPerformAction(userRole, "create")  // Admin: true, Pro/User: false
canReadVisibility(userRole, "private") // Admin/Pro: true, User: false

// 获取可读取的资源类型
getReadableVisibilities("pro")  // ["public", "private"]
```

### 2. tRPC 中间件 (`/src/trpc/init.ts`)
```typescript
// 操作权限检查
actionProcedure("create")    // 只允许Admin创建
actionProcedure("update")    // 只允许Admin更新
actionProcedure("delete")    // 只允许Admin删除

// 读取权限检查
readProcedure               // 根据用户角色自动过滤可见性
```

## 🚀 实际使用示例

### 品牌管理 Procedures

```typescript
// 1. 获取品牌列表 - 自动过滤visibility
const brands = await trpc.brand.getAll.query();
// Admin: 看到所有品牌 (public + private + draft)
// Pro: 看到 public + private 品牌
// User: 只看到 public 品牌

// 2. 创建品牌 - 只有Admin可以
const newBrand = await trpc.brand.create.mutate({
  name: "New Brand",
  description: "Brand description"
});
// Admin: ✅ 成功创建
// Pro/User: ❌ 抛出 FORBIDDEN 错误

// 3. 更新品牌 - 只有Admin可以
const updated = await trpc.brand.update.mutate({
  id: "brand-id",
  name: "Updated Name"
});
// Admin: ✅ 成功更新
// Pro/User: ❌ 抛出 FORBIDDEN 错误
```

### 客户端权限检查

```typescript
import { authClient } from "@/modules/auth/lib/auth-client";

// 检查当前用户权限
const session = await authClient.getSession();
const userRole = session?.user?.role;

// 前端根据角色显示不同UI
if (userRole === "admin") {
  // 显示创建、编辑、删除按钮
} else if (userRole === "pro") {
  // 只显示查看按钮，可以看private内容
} else {
  // 只显示基础查看功能
}
```

## ⚡ 开发最佳实践

### 1. 数据库Schema设计
确保你的表包含 `visibility` 字段：
```sql
-- 示例：products表
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  visibility VARCHAR(20) DEFAULT 'draft' CHECK (visibility IN ('public', 'private', 'draft')),
  -- 其他字段...
);
```

### 2. 新增资源的权限控制
```typescript
// 新增 documents procedures
export const documentProcedure = createTRPCRouter({
  // 获取文档 - 自动过滤visibility
  getAll: readProcedure.query(async ({ ctx }) => {
    const docs = await db.select().from(documents);
    return filterByVisibility(docs, ctx.userRole);
  }),
  
  // 创建文档 - 只有Admin
  create: actionProcedure("create")
    .input(documentSchema)
    .mutation(async ({ input }) => {
      return await db.insert(documents).values(input);
    }),
});
```

### 3. 错误处理
```typescript
try {
  await trpc.brand.create.mutate(data);
} catch (error) {
  if (error.data?.code === "FORBIDDEN") {
    toast.error("权限不足，无法执行此操作");
  } else if (error.data?.code === "UNAUTHORIZED") {
    toast.error("请先登录");
  }
}
```

## 🔍 测试权限系统

### 1. 单元测试示例
```typescript
import { canPerformAction, canReadVisibility } from "@/lib/permissions";

describe("权限系统测试", () => {
  test("Admin权限", () => {
    expect(canPerformAction("admin", "create")).toBe(true);
    expect(canReadVisibility("admin", "private")).toBe(true);
  });
  
  test("Pro权限", () => {
    expect(canPerformAction("pro", "create")).toBe(false);
    expect(canReadVisibility("pro", "private")).toBe(true);
  });
  
  test("User权限", () => {
    expect(canPerformAction("user", "create")).toBe(false);
    expect(canReadVisibility("user", "private")).toBe(false);
  });
});
```

### 2. E2E测试场景
```typescript
// 测试不同角色的API访问
describe("API权限测试", () => {
  test("Admin可以创建品牌", async () => {
    const adminSession = await loginAsAdmin();
    const result = await trpc.brand.create.mutate({
      name: "Test Brand"
    });
    expect(result).toBeDefined();
  });
  
  test("Pro用户无法创建品牌", async () => {
    const proSession = await loginAsPro();
    await expect(
      trpc.brand.create.mutate({ name: "Test" })
    ).rejects.toThrow("FORBIDDEN");
  });
});
```

## 📚 扩展指南

### 添加新操作类型
在 `permissions.ts` 中添加新的 `ActionType`：
```typescript
export type ActionType = "create" | "read" | "update" | "delete" | "publish" | "approve";
```

### 添加新可见性级别
```typescript
export type ResourceVisibility = "public" | "private" | "draft" | "archived";
```

### 自定义权限规则
```typescript
export const PERMISSION_RULES = {
  // 添加新角色
  moderator: {
    canCreate: true,
    canUpdate: true,
    canDelete: false,
    canPublish: true,
    canReadVisibilities: ["public", "private"],
  },
  // ...其他角色
};
```

这样就完成了一个完整的基于better-auth和tRPC的权限控制系统！
