import { createTRPCRouter, readProcedure, actionProcedure, publicReadProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";

export const brandProcedure = createTRPCRouter({
  // 允许未登录用户查看品牌列表
  getAll: publicReadProcedure.query(async () => {
    return await db.select().from(brands);
  }),
  // 允许未登录用户查看品牌详情
  getById: publicReadProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const brand = await db
        .select()
        .from(brands)
        .where(eq(brands.id, input.id));
      return brand[0] || null;
    }),
  create: actionProcedure("create", "product")
    .input(
      z.object({
        name: z.string().min(1),
        fullName: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(brands).values(input).returning();
    }),
  update: actionProcedure("update", "product")
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        fullName: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db
        .update(brands)
        .set(updateData)
        .where(eq(brands.id, id))
        .returning();
    }),
  delete: actionProcedure("delete", "product")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(brands).where(eq(brands.id, input.id));
    }),
  getStats: readProcedure.query(async ({ ctx }) => {
    const allBrands = await db.select().from(brands);

    return {
      total: allBrands.length,
      userRole: ctx.userRole,
      canManage: ctx.userRole === "admin",
    };
  }),
});
