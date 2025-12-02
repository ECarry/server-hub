import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { db } from "@/db";
import { brands, productSeries } from "@/db/schema";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";

export const seriesRouter = createTRPCRouter({
  getMany: publicProcedure.query(async () => {
    const data = await db
      .select({
        id: productSeries.id,
        name: productSeries.name,
        brandId: productSeries.brandId,
        brandName: brands.name,
        brandLogoKey: brands.logoImageKey,
      })
      .from(productSeries)
      .innerJoin(brands, eq(brands.id, productSeries.brandId))
      .orderBy(desc(productSeries.updatedAt));

    return data;
  }),
});
