import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Define resources and their available actions
export const statement = {
  ...defaultStatements, // Includes default user and session resources
  product: ["create", "update", "delete", "read"],
  document: ["create", "update", "delete", "read", "read_private"],
  download: ["create", "update", "delete", "read", "read_private"],
  post: ["create", "update", "delete", "read"],
  comment: ["create", "update", "delete", "read"],
} as const;

// Create access controller
export const ac = createAccessControl(statement);

// Define admin role with full permissions
export const admin = ac.newRole({
  ...adminAc.statements, // Include default admin permissions
  product: ["create", "update", "delete", "read"],
  document: ["create", "update", "delete", "read", "read_private"],
  download: ["create", "update", "delete", "read", "read_private"],
  post: ["create", "update", "delete", "read"],
  comment: ["create", "update", "delete", "read"],
});

// Define pro role - can read private content but not modify
export const pro = ac.newRole({
  product: ["read"],
  document: ["read", "read_private"],
  download: ["read", "read_private"],
  post: ["read"],
  comment: ["read"],
});

// Define user role - can only read public content
export const user = ac.newRole({
  product: ["read"],
  document: ["read"],
  download: ["read"],
  post: ["read"],
  comment: ["read"],
});
