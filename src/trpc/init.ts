import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";
import { User } from "@/modules/auth/lib/auth-types";

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { session, user: session?.user };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user as User,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// Helper to check permissions using Better Auth's admin plugin
const hasPermission = (permissions: Record<string, string[]>) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.user.id;
    const result = await auth.api.userHasPermission({
      body: {
        userId,
        permissions,
      },
    });

    if (!result?.success) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to perform this action" });
    }

    return next();
  });
};

// Deprecated: Use hasPermission instead for fine-grained control
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if ((ctx.user as any).role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

// Deprecated: Use hasPermission instead for fine-grained control
export const proProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = (ctx.user as any).role;
  if (role !== "pro" && role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

// Export permission helpers for use in routers
export { hasPermission };