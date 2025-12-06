"use client";

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

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold mb-2">No products found</p>
        <p className="text-muted-foreground">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 content-start gap-x-5 gap-y-8 md:gap-x-6 md:gap-y-12">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export const ProductsViewLoading = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 content-start gap-x-5 gap-y-8 md:gap-x-6 md:gap-y-12">
      {Array.from({ length: 15 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-[280px] md:h-[320px] w-full rounded-[24px]" />
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
  );
};
