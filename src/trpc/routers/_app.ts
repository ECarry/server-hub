import { createTRPCRouter } from "../init";
import { brandsRouter } from "@/modules/brands/server/procedures";
import { seriesRouter } from "@/modules/series/server/procedures";

export const appRouter = createTRPCRouter({
  brands: brandsRouter,
  series: seriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
