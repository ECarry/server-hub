import { db } from "@/db";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  products,
  productsUpdateSchema,
  productsCategories,
  productSeries,
  brands,
  productImageInsertSchema,
  productImage,
} from "@/db/schema";
import { productInsertSchema } from "@/modules/products/schemas";
import { eq, desc, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
  create: adminProcedure
    .input(productInsertSchema)
    .mutation(async ({ input }) => {
      const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.model, input.model))
        .limit(1);

      if (existingProduct) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product already exists",
        });
      }

      const [newProduct] = await db.insert(products).values(input).returning();

      return newProduct;
    }),
  update: adminProcedure
    .input(productsUpdateSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing product ID",
        });
      }

      const [updatedProduct] = await db
        .update(products)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      return updatedProduct;
    }),
  remove: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [deletedProduct] = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      return deletedProduct;
    }),
  getMany: adminProcedure.query(async () => {
    const data = await db
      .select({
        ...getTableColumns(products),
        category: productsCategories.name,
        brand: brands.name,
        brandLogoKey: brands.logoImageKey,
        series: productSeries.name,
      })
      .from(products)
      .innerJoin(
        productsCategories,
        eq(products.categoryId, productsCategories.id)
      )
      .innerJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(productSeries, eq(products.seriesId, productSeries.id))
      .orderBy(desc(products.updatedAt))
      .limit(100);

    return data;
  }),
  getOne: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [data] = await db
        .select({
          ...getTableColumns(products),
          category: productsCategories.name,
          brand: brands.name,
          brandLogoKey: brands.logoImageKey,
          series: productSeries.name,
        })
        .from(products)
        .innerJoin(
          productsCategories,
          eq(products.categoryId, productsCategories.id)
        )
        .innerJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(productSeries, eq(products.seriesId, productSeries.id))
        .where(eq(products.id, id))
        .limit(1);

      return data;
    }),
  getCategories: adminProcedure.query(async () => {
    const data = await db.select().from(productsCategories);

    return data;
  }),
  createImage: adminProcedure
    .input(productImageInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { productId, imageKey, primary } = input;
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      if (!productId || !imageKey) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [newImage] = await db
        .insert(productImage)
        .values({
          productId,
          imageKey,
          primary,
        })
        .returning();

      return newImage;
    }),
});
