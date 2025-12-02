import { db } from "@/db";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  products,
  productsInsertSchema,
  productsUpdateSchema,
  productsCategories,
  productSeries,
  brands,
} from "@/db/schema";
import { eq, desc, getTableColumns } from "drizzle-orm";
import { z } from "zod";

export const productsRouter = createTRPCRouter({
  create: adminProcedure
    .input(productsInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

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
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { role } = ctx.user;

      if (role !== "admin") {
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
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

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
  getMany: adminProcedure.query(async ({ ctx }) => {
    const { role } = ctx.user;

    if (role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

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
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const { role } = ctx.user;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

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
  getManyCategories: adminProcedure.query(async () => {
    const data = await db.select().from(productsCategories);

    return data;
  }),
});
