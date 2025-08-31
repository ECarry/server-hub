"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const BrandsView = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.brands.getAll.queryOptions());
  return <div>{JSON.stringify(data, null, 2)}</div>;
};
