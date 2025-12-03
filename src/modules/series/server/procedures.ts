import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { db } from "@/db";
import { brands, productSeries } from "@/db/schema";
import { desc, ilike, count } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { DEFAULT_PAGE } from "@/constants";
import { MIN_PAGE_SIZE, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/constants";

export const seriesRouter = createTRPCRouter({
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
