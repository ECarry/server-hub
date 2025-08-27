import { 
  createTRPCRouter, 
  readProcedure,
  actionProcedure,
  filterByVisibility
} from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq } from "drizzle-orm";

export const brandProcedure = createTRPCRouter({
  // 公开访问 - 获取所有品牌列表（根据用户权限过滤visibility）
  getAll: readProcedure.query(async ({ ctx }) => {
    const allBrands = await db.select().from(brands);
    
    // 根据用户权限过滤可见性
    // 注意：这里假设brands表有visibility字段，如果没有则默认为public
    return filterByVisibility(
      allBrands.map(brand => ({
        ...brand,
        visibility: "public" as const // 根据实际数据库字段调整
      })), 
      ctx.userRole
    );
  }),

  // 需要登录 - 获取单个品牌详情（检查visibility权限）
  getById: readProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const brand = await db.select().from(brands).where(eq(brands.id, input.id));
      if (!brand.length) return null;
      
      // 检查用户是否可以查看该资源
      const brandWithVisibility = {
        ...brand[0],
        visibility: "public" as const // 根据实际数据库字段设置
      };
      
      const filtered = filterByVisibility([brandWithVisibility], ctx.userRole);
      return filtered.length > 0 ? filtered[0] : null;
    }),

  // 只有Admin可以创建品牌
  create: actionProcedure("create")
    .input(z.object({
      name: z.string().min(1),
      fullName: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.insert(brands).values(input).returning();
    }),

  // 只有Admin可以更新品牌
  update: actionProcedure("update")
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      fullName: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db.update(brands)
        .set(updateData)
        .where(eq(brands.id, id))
        .returning();
    }),

  // 只有Admin可以删除品牌
  delete: actionProcedure("delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(brands).where(eq(brands.id, input.id));
    }),

  // 获取用户可访问的统计信息
  getStats: readProcedure.query(async ({ ctx }) => {
    const allBrands = await db.select().from(brands);
    
    // 根据权限过滤
    const accessibleBrands = filterByVisibility(
      allBrands.map(brand => ({ ...brand, visibility: "public" as const })),
      ctx.userRole
    );
    
    return {
      total: accessibleBrands.length,
      userRole: ctx.userRole,
      canManage: ctx.userRole === "admin",
      readableVisibilities: ctx.readableVisibilities,
    };
  }),
});
