import { db } from "@/db";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  products,
  productsCategories,
  productSeries,
  brands,
  productImageInsertSchema,
  productImage,
  documentsInsertSchema,
  documents,
} from "@/db/schema";
import { productInsertSchema, productUpdateSchema } from "@/modules/products/schemas";
import { eq, desc, getTableColumns, ilike, count } from "drizzle-orm";
import { z } from "zod";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";

export const productsRouter = createTRPCRouter({
  // Products
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
    .input(productUpdateSchema)
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
        .select({
          ...getTableColumns(products),
          category: productsCategories.name,
          brand: brands.name,
          brandLogoKey: brands.logoImageKey,
          series: productSeries.name,
        })
        .from(products)
        .where(search ? ilike(products.model, `%${search}%`) : undefined)
        .innerJoin(
          productsCategories,
          eq(products.categoryId, productsCategories.id)
        )
        .innerJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(productSeries, eq(products.seriesId, productSeries.id))
        .orderBy(desc(products.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await db
        .select({
          count: count(),
        })
        .from(products)
        .where(search ? ilike(products.model, `%${search}%`) : undefined);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
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
  // Product Categories
  getCategories: adminProcedure.query(async () => {
    const data = await db.select().from(productsCategories);

    return data;
  }),
  // Product Images
  createImage: adminProcedure
    .input(productImageInsertSchema)
    .mutation(async ({ input }) => {
      const { productId, imageKey, primary } = input;

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
  removeImage: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [deletedImage] = await db
        .delete(productImage)
        .where(eq(productImage.id, id))
        .returning();

      return deletedImage;
    }),
  getImages: adminProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { productId } = input;

      if (!productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const data = await db
        .select()
        .from(productImage)
        .where(eq(productImage.productId, productId));

      return data;
    }),
  // Product Documentations
  createDocumentation: adminProcedure
    .input(documentsInsertSchema)
    .mutation(async ({ input }) => {

      const [newDocument] = await db
        .insert(documents)
        .values(input)
        .returning();

      return newDocument;
    }),
  removeDocumentation: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [deletedDocumentation] = await db
        .delete(documents)
        .where(eq(documents.id, id))
        .returning();

      return deletedDocumentation;
    }),
  getDocumentations: adminProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .query(async ({ input }) => {
      const { productId } = input;

      if (!productId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const data = await db
        .select()
        .from(documents)
        .where(eq(documents.productId, productId))
        .orderBy(desc(documents.updatedAt));

      return data;
    }),
});
