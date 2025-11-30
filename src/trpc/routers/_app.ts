import { z } from 'zod';
import {
  baseProcedure,
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  proProcedure,
  hasPermission
} from '../init';

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  rbac: createTRPCRouter({
    public: publicProcedure.query(() => "I am public"),
    protected: protectedProcedure.query(({ ctx }) => `I am protected. User: ${ctx.user.id}`),
    admin: adminProcedure.query(() => "I am admin only [DEPRECATED]"),
    pro: proProcedure.query(() => "I am pro or admin [DEPRECATED]"),
  }),

  // New permission-based endpoints
  permissions: createTRPCRouter({
    createProduct: hasPermission({ product: ["create"] })
      .mutation(() => "Product created! (Admin only)"),

    readPrivateDocument: hasPermission({ document: ["read_private"] })
      .query(() => "Private document content (Pro or Admin only)"),

    readPublicDocument: protectedProcedure
      .query(() => "Public document content (All authenticated users)"),
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;