import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { ProductsView, ProductsViewLoading } from "@/modules/home/ui/views/products-view";
import { BrandsView, BrandsViewLoading } from "@/modules/home/ui/views/brands-view";

export default function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.home.getManyProducts.queryOptions());
  void queryClient.prefetchQuery(trpc.home.getManyBrands.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>

      <div className="flex flex-col space-y-6">
        <div className="px-5 sm:px-6 md:px-8 lg:px-12 xl:px-20 space-y-6 pb-8">
          <h1 className="text-[44px] font-semibold">Discover</h1>

          {/* Brands view */}
          <Suspense fallback={<BrandsViewLoading />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <BrandsView />
            </ErrorBoundary>
          </Suspense>


          {/* Products Card view */}
          <Suspense fallback={<ProductsViewLoading />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <ProductsView />
            </ErrorBoundary>
          </Suspense>


        </div>
      </div>
    </HydrationBoundary>
  );
}
