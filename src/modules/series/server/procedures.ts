import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { db } from "@/db";
import { brands, productSeries } from "@/db/schema";
import { desc, ilike, count } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { DEFAULT_PAGE } from "@/constants";
import { MIN_PAGE_SIZE, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants";

export const seriesRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string().min(1), brandId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [newSeries] = await db.insert(productSeries).values(input).returning();
      return newSeries;
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [series] = await db
        .select()
        .from(productSeries)
        .where(eq(productSeries.id, input.id))
        .limit(1);
      return series;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        brandId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [updatedSeries] = await db
        .update(productSeries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(productSeries.id, id))
        .returning();
      return updatedSeries;
    }),
  remove: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const [deletedSeries] = await db
        .delete(productSeries)
        .where(eq(productSeries.id, id))
        .returning();
      return deletedSeries;
    }),
  getMany: publicProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;

      const data = await db
        .select({
          id: productSeries.id,
          name: productSeries.name,
          brandId: productSeries.brandId,
          brandName: brands.name,
          brandLogoKey: brands.logoImageKey,
        })
        .from(productSeries)
        .where(search ? ilike(productSeries.name, `%${search}%`) : undefined)
        .innerJoin(brands, eq(brands.id, productSeries.brandId))
        .orderBy(desc(productSeries.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({
          count: count(),
        })
        .from(productSeries)
        .where(search ? ilike(productSeries.name, `%${search}%`) : undefined);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
