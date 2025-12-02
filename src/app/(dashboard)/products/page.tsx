import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductsView,
  ProductsViewSkeleton,
} from "@/modules/products/ui/views/products-view";

export const dynamic = "force-dynamic";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.products.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductsViewSkeleton />}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <ProductsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;
