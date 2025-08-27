import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import {
  canPerformAction,
  getReadableVisibilities,
  type UserRole,
  type ActionType,
  type ResourceVisibility,
} from "@/lib/permissions";

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
export const actionProcedure = (action: ActionType) =>
  authenticatedProcedure.use(async ({ ctx, next }) => {
    const userRole = ctx.user.role as UserRole;

    if (!canPerformAction(userRole, action)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${userRole} role cannot perform ${action} action`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        userRole,
      },
    });
  });

// Visibility-aware read procedure
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

// Resource visibility filter helper
export function filterByVisibility<T extends { visibility: string }>(
  items: T[],
  userRole: UserRole
): T[] {
  const readableVisibilities = getReadableVisibilities(userRole);
  return items.filter((item) =>
    readableVisibilities.includes(item.visibility as ResourceVisibility)
  );
}
