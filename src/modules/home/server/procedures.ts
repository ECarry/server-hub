import { db } from "@/db";
import {
  brands,
  products,
  productsCategories,
  productSeries,
  productImage,
} from "@/db/schema";
import { publicProcedure, createTRPCRouter } from "@/trpc/init";
import { eq, desc, getTableColumns, inArray } from "drizzle-orm";

export const homeRouter = createTRPCRouter({
  getManyProducts: publicProcedure.query(async () => {
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
      .where(eq(products.visibility, "public"))
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
});
