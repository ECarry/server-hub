import { createTRPCRouter } from "../init";
import { brandsRouter } from "@/modules/brands/server/procedures";

export const appRouter = createTRPCRouter({
  brands: brandsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
