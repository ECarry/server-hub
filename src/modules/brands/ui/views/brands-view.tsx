"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useBrandsFilters } from "@/modules/brands/hooks/use-brands-filters";

export const BrandsView = () => {
  const trpc = useTRPC();
  const [filters] = useBrandsFilters();

  const { data } = useSuspenseQuery(
    trpc.brands.getMany.queryOptions({ ...filters })
  );
  return <div>{JSON.stringify(data, null, 2)}</div>;
};
