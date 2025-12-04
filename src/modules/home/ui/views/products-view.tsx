'use client';

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard } from "../components/product-card";
import { useHomeFilters } from "../../hooks/use-home-filters";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductsView = () => {
  const trpc = useTRPC();
  const [filters] = useHomeFilters();

  const { data } = useSuspenseQuery(
    trpc.home.getManyProducts.queryOptions({
      brandId: filters.brandId || undefined,
    })
  );


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 content-start gap-x-6 gap-y-10">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}


export const ProductsViewLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 content-start gap-x-6 gap-y-10">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-[300px] w-full rounded-[28px]" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}