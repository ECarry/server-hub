import { createTRPCRouter, publicReadProcedure } from "@/trpc/init";
import { z } from "zod";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { ilike, count, desc } from "drizzle-orm";

import {
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
} from "@/constants";

export const brandsRouter = createTRPCRouter({
  getMany: publicReadProcedure
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
