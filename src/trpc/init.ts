import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import {
  canPerformAction,
  getReadableVisibilities,
  type UserRole,
} from "@/modules/auth/lib/permissions";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session,
    user: session?.user || null,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Base procedure without auth
export const baseProcedure = t.procedure;

// Authenticated procedure - requires login
export const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

// Action-based permission procedure
export const actionProcedure = (
  action: "create" | "read" | "update" | "delete" | "publish",
  resource: "product" | "post" | "document" | "firmware"
) =>
  authenticatedProcedure.use(async ({ ctx, next }) => {
    const userRole = ctx.user.role as UserRole;

    if (!canPerformAction(userRole, action, resource)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${userRole} role cannot perform ${action} action on ${resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  });

// Visibility-aware read procedure (requires authentication)
export const readProcedure = authenticatedProcedure.use(
  async ({ ctx, next }) => {
    const userRole = ctx.user.role as UserRole;
    const readableVisibilities = getReadableVisibilities(userRole);

    return next({
      ctx: {
        ...ctx,
        userRole,
        readableVisibilities,
      },
    });
  }
);

// Public read procedure (allows unauthenticated access to public resources)
export const publicReadProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const userRole = ctx.user?.role as UserRole | undefined;
  const readableVisibilities = userRole
    ? getReadableVisibilities(userRole)
    : ["public"]; // 未登录用户只能看到 public 资源

  return next({
    ctx: {
      ...ctx,
      userRole: userRole || "user", // 默认为 user 角色
      readableVisibilities,
    },
  });
});

// Resource visibility filter helper
export function filterByVisibility<T extends { visibility: string }>(
  items: T[],
  userRole: UserRole
): T[] {
  const readableVisibilities = getReadableVisibilities(userRole);
  return items.filter((item) =>
    readableVisibilities.includes(
      item.visibility as "public" | "private" | "draft"
    )
  );
}

// Resource visibility filter helper with custom visibilities
export function filterByVisibilities<T extends { visibility: string }>(
  items: T[],
  readableVisibilities: string[]
): T[] {
  return items.filter((item) => readableVisibilities.includes(item.visibility));
}
