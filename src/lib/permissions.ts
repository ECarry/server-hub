/**
 * 用户角色类型
 */
export type UserRole = "admin" | "pro" | "user";

/**
 * 资源可见性类型 - 对应数据库中的visibility字段
 */
export type ResourceVisibility = "public" | "private" | "draft";

/**
 * 操作类型
 */
export type ActionType = "create" | "read" | "update" | "delete" | "publish";

/**
 * 权限检查规则
 * Admin: 完全控制所有资源和操作
 * Pro: 只能查看public和private资源，不能创建/管理
 * User: 只能查看public资源
 */
export const PERMISSION_RULES = {
  admin: {
    canCreate: true,
    canUpdate: true,  
    canDelete: true,
    canPublish: true,
    canReadVisibilities: ["public", "private", "draft"] as ResourceVisibility[],
  },
  pro: {
    canCreate: false,
    canUpdate: false,
    canDelete: false, 
    canPublish: false,
    canReadVisibilities: ["public", "private"] as ResourceVisibility[],
  },
  user: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canPublish: false,
    canReadVisibilities: ["public"] as ResourceVisibility[],
  },
} as const;

/**
 * 检查用户是否可以执行指定操作
 */
export function canPerformAction(userRole: UserRole, action: ActionType): boolean {
  const rules = PERMISSION_RULES[userRole];
  
  switch (action) {
    case "create":
      return rules.canCreate;
    case "update":
      return rules.canUpdate;
    case "delete":
      return rules.canDelete;
    case "publish":
      return rules.canPublish;
    case "read":
      return true; // 读取权限通过visibility单独检查
    default:
      return false;
  }
}

/**
 * 检查用户是否可以读取指定可见性的资源
 */
export function canReadVisibility(userRole: UserRole, visibility: ResourceVisibility): boolean {
  const rules = PERMISSION_RULES[userRole];
  return rules.canReadVisibilities.includes(visibility);
}

/**
 * 获取用户可以读取的可见性列表
 */
export function getReadableVisibilities(userRole: UserRole): ResourceVisibility[] {
  return PERMISSION_RULES[userRole].canReadVisibilities;
}

/**
 * 权限验证错误类
 */
export class PermissionError extends Error {
  constructor(
    message: string, 
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' = 'FORBIDDEN'
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * 验证用户操作权限 - 抛出错误如果权限不足
 */
export function validatePermission(
  userRole: UserRole, 
  action: ActionType, 
  resourceVisibility?: ResourceVisibility
): void {
  // 检查操作权限
  if (!canPerformAction(userRole, action)) {
    throw new PermissionError(
      `${userRole} role cannot perform ${action} action`,
      'FORBIDDEN'
    );
  }

  // 对于读取操作，检查可见性权限
  if (action === 'read' && resourceVisibility && !canReadVisibility(userRole, resourceVisibility)) {
    throw new PermissionError(
      `${userRole} role cannot read ${resourceVisibility} resources`,
      'FORBIDDEN'
    );
  }
}
