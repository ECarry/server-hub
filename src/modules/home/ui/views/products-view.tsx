'use client';

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard } from "../components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductsView = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.home.getManyProducts.queryOptions());


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
        <Skeleton key={index} className="h-[300px] w-full" />
      ))}
    </div>
  )
}