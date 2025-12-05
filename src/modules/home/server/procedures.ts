import { db } from "@/db";
import {
  brands,
  products,
  productsCategories,
  productSeries,
  productImage,
  documents,
  downloads,
} from "@/db/schema";
import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { eq, desc, getTableColumns, inArray, and } from "drizzle-orm";
import { z } from "zod";

export const homeRouter = createTRPCRouter({
  getManyProducts: publicProcedure
    .input(
      z
        .object({
          brandId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      // First query: Get products
      const productsData = await db
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
        .where(
          input?.brandId
            ? eq(products.brandId, input.brandId)
            : eq(products.visibility, "public")
        )
        .orderBy(desc(products.updatedAt), desc(products.id))
        .limit(10);

      if (productsData.length === 0) {
        return [];
      }

      // Second query: Get all images for these products
      const productIds = productsData.map((p) => p.id);
      const allImages = await db
        .select()
        .from(productImage)
        .where(inArray(productImage.productId, productIds))
        .orderBy(productImage.createdAt);

      // Group images by productId in memory
      const imagesByProductId = allImages.reduce((acc, image) => {
        if (!acc[image.productId]) {
          acc[image.productId] = [];
        }
        acc[image.productId].push(image);
        return acc;
      }, {} as Record<string, typeof allImages>);

      // Combine products with their images
      return productsData.map((product) => ({
        ...product,
        images: imagesByProductId[product.id] || [],
      }));
    }),
  getManyBrands: publicProcedure.query(async () => {
    const brandsData = await db.select().from(brands);
    return brandsData;
  }),
  getProductById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const [product, images, productDocuments, productDownloads] =
        await Promise.all([
          db
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
            .where(
              and(
                eq(products.id, input),
                inArray(products.visibility, ["public"])
              )
            )
            .then((rows) => rows[0] || null),
          db
            .select()
            .from(productImage)
            .where(eq(productImage.productId, input))
            .orderBy(productImage.createdAt),
          db
            .select()
            .from(documents)
            .where(
              and(
                eq(documents.productId, input),
                eq(documents.visibility, "public")
              )
            )
            .orderBy(desc(documents.createdAt)),
          db
            .select()
            .from(downloads)
            .where(
              and(
                eq(downloads.productId, input),
                eq(downloads.visibility, "public")
              )
            )
            .orderBy(desc(downloads.createdAt)),
        ]);

      if (!product) {
        return null;
      }

      return {
        ...product,
        images,
        documents: productDocuments,
        downloads: productDownloads,
      };
    }),
});
