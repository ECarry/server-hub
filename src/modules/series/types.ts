import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/trpc/routers/_app";

export type SeriesGetMany = inferRouterOutputs<
  typeof appRouter
>["series"]["getMany"];
