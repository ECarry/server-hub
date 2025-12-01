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

// Define pro role - can read private content and create comments
export const pro = ac.newRole({
  product: ["read"],
  document: ["read", "read_private"],
  download: ["read", "read_private"],
  post: ["read"],
  comment: ["create", "read"], // Pro users can create comments
});

// Define user role - can create and read comments, read public content
// Note: update/delete for comments require ownership check (handled in tRPC)
export const user = ac.newRole({
  product: ["read"],
  document: ["read"],
  download: ["read"],
  post: ["read"],
  comment: ["create", "read"], // All users can create comments
});
