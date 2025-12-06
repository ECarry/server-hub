import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { ilike, count, desc, eq } from "drizzle-orm";

import {
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
} from "@/constants";

export const brandsRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        fullName: z.string().optional(),
        description: z.string().optional(),
        logoImageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newBrand] = await db.insert(brands).values(input).returning();
      return newBrand;
    }),
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [brand] = await db
        .select()
        .from(brands)
        .where(eq(brands.id, input.id))
        .limit(1);
      return brand;
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        fullName: z.string().optional(),
        description: z.string().optional(),
        logoImageKey: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [updatedBrand] = await db
        .update(brands)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(brands.id, id))
        .returning();
      return updatedBrand;
    }),
  remove: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const [deletedBrand] = await db
        .delete(brands)
        .where(eq(brands.id, id))
        .returning();
      return deletedBrand;
    }),
  getAll: adminProcedure.query(async () => {
    const data = await db.select().from(brands);
    return data;
  }),
  getMany: adminProcedure
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
        .select()
        .from(brands)
        .where(search ? ilike(brands.name, `%${search}%`) : undefined)
        .orderBy(desc(brands.createdAt), desc(brands.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({
          count: count(),
        })
        .from(brands)
        .where(search ? ilike(brands.name, `%${search}%`) : undefined);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
