import { createAccessControl } from "better-auth/plugins/access";

/**
 * 资源可见性类型 - 对应数据库中的visibility字段
 */
export type ProductVisibility = "public" | "private" | "draft";
export type PostVisibility = "public" | "private" | "draft";
export type FileVisibility = "public" | "private";

/**
 * 权限声明 - 定义所有可能的资源和操作
 */
const statement = {
  product: ["create", "read", "update", "delete", "publish"],
  post: ["create", "read", "update", "delete", "publish"],
  document: ["create", "read", "update", "delete"],
  firmware: ["create", "read", "update", "delete"],
  // 可见性权限
  public: ["view"],
  private: ["view"], 
  draft: ["view"],
} as const;

/**
 * 创建访问控制实例
 */
export const ac = createAccessControl(statement);

/**
 * 用户角色定义
 * User: 只能查看public资源
 */
export const userRole = ac.newRole({
  product: ["read"],
  post: ["read"],
  document: ["read"],
  firmware: ["read"],
  public: ["view"],
});

/**
 * Pro角色定义
 * Pro: 可以查看public和private资源，不能创建/管理
 */
export const proRole = ac.newRole({
  product: ["read"],
  post: ["read"],
  document: ["read"],
  firmware: ["read"],
  public: ["view"],
  private: ["view"],
});

/**
 * 管理员角色定义
 * Admin: 完全控制所有资源和操作
 */
export const adminRole = ac.newRole({
  product: ["create", "read", "update", "delete", "publish"],
  post: ["create", "read", "update", "delete", "publish"],
  document: ["create", "read", "update", "delete"],
  firmware: ["create", "read", "update", "delete"],
  public: ["view"],
  private: ["view"],
  draft: ["view"],
});

/**
 * 角色映射 - 将字符串角色名映射到角色对象
 */
export const ROLES = {
  user: userRole,
  pro: proRole,
  admin: adminRole,
} as const;

export type UserRole = keyof typeof ROLES;

/**
 * 权限检查规则 - 基于角色的权限映射
 */
const PERMISSION_RULES = {
  user: {
    resources: {
      product: ["read"] as const,
      post: ["read"] as const,
      document: ["read"] as const,
      firmware: ["read"] as const,
    },
    visibilities: ["public"] as const,
  },
  pro: {
    resources: {
      product: ["read"] as const,
      post: ["read"] as const,
      document: ["read"] as const,
      firmware: ["read"] as const,
    },
    visibilities: ["public", "private"] as const,
  },
  admin: {
    resources: {
      product: ["create", "read", "update", "delete", "publish"] as const,
      post: ["create", "read", "update", "delete", "publish"] as const,
      document: ["create", "read", "update", "delete"] as const,
      firmware: ["create", "read", "update", "delete"] as const,
    },
    visibilities: ["public", "private", "draft"] as const,
  },
};

/**
 * 权限验证错误类
 */
export class PermissionError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHORIZED" | "FORBIDDEN" = "FORBIDDEN"
  ) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * 检查用户是否可以执行指定操作
 */
export function canPerformAction(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete" | "publish",
  resource: "product" | "post" | "document" | "firmware"
): boolean {
  const rules = PERMISSION_RULES[userRole];
  const resourceActions = rules.resources[resource];
  if (!resourceActions) return false;
  return (resourceActions as readonly string[]).includes(action);
}

/**
 * 检查用户是否可以读取指定可见性的资源
 */
export function canReadVisibility(
  userRole: UserRole,
  visibility: "public" | "private" | "draft"
): boolean {
  const rules = PERMISSION_RULES[userRole];
  return (rules.visibilities as readonly string[]).includes(visibility);
}

/**
 * 获取用户可以读取的可见性列表
 */
export function getReadableVisibilities(
  userRole: UserRole
): ("public" | "private" | "draft")[] {
  const rules = PERMISSION_RULES[userRole];
  return [...rules.visibilities] as ("public" | "private" | "draft")[];
}

/**
 * 验证用户操作权限 - 抛出错误如果权限不足
 */
export function validatePermission(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete" | "publish",
  resource: "product" | "post" | "document" | "firmware",
  resourceVisibility?: "public" | "private" | "draft"
): void {
  // 检查操作权限
  if (!canPerformAction(userRole, action, resource)) {
    throw new PermissionError(
      `${userRole} role cannot perform ${action} action on ${resource}`,
      "FORBIDDEN"
    );
  }

  // 对于读取操作，检查可见性权限
  if (
    action === "read" &&
    resourceVisibility &&
    !canReadVisibility(userRole, resourceVisibility)
  ) {
    throw new PermissionError(
      `${userRole} role cannot read ${resourceVisibility} ${resource}`,
      "FORBIDDEN"
    );
  }
}

// 针对具体资源的便捷函数

/**
 * 检查产品权限
 */
export function canAccessProduct(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete" | "publish",
  visibility?: ProductVisibility
): boolean {
  if (!canPerformAction(userRole, action, "product")) {
    return false;
  }
  if (action === "read" && visibility && !canReadVisibility(userRole, visibility)) {
    return false;
  }
  return true;
}

/**
 * 检查文章权限
 */
export function canAccessPost(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete" | "publish",
  visibility?: PostVisibility
): boolean {
  if (!canPerformAction(userRole, action, "post")) {
    return false;
  }
  if (action === "read" && visibility && !canReadVisibility(userRole, visibility)) {
    return false;
  }
  return true;
}

/**
 * 检查文档权限
 */
export function canAccessDocument(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete",
  visibility?: FileVisibility
): boolean {
  if (!canPerformAction(userRole, action, "document")) {
    return false;
  }
  if (action === "read" && visibility && !canReadVisibility(userRole, visibility)) {
    return false;
  }
  return true;
}

/**
 * 检查固件权限
 */
export function canAccessFirmware(
  userRole: UserRole,
  action: "create" | "read" | "update" | "delete",
  visibility?: FileVisibility
): boolean {
  if (!canPerformAction(userRole, action, "firmware")) {
    return false;
  }
  if (action === "read" && visibility && !canReadVisibility(userRole, visibility)) {
    return false;
  }
  return true;
}

