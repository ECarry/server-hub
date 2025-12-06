import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  ProductsView,
  ProductsViewLoading,
} from "@/modules/home/ui/views/products-view";
import {
  BrandsView,
  BrandsViewLoading,
} from "@/modules/home/ui/views/brands-view";
import { loadSearchParams } from "@/modules/home/params";
import { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.home.getManyProducts.queryOptions({
      brandId: filters.brandId || undefined,
    })
  );
  void queryClient.prefetchQuery(trpc.home.getManyBrands.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Hero Section */}
      <div className="px-5 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-8 md:pt-12 pb-6">
        <div className="max-w-4xl">
          <h1 className="text-[48px] md:text-[64px] font-bold leading-tight tracking-tight mb-4">
            Discover
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-normal">
            Browse servers storages & networks
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-6 md:px-8 lg:px-12 xl:px-20 space-y-8 pb-16">
        {/* Brands Filter */}
        <Suspense fallback={<BrandsViewLoading />}>
          <ErrorBoundary fallback={<p>Something went wrong</p>}>
            <BrandsView />
          </ErrorBoundary>
        </Suspense>

        {/* Products Grid */}
        <Suspense fallback={<ProductsViewLoading />}>
          <ErrorBoundary fallback={<p>Something went wrong</p>}>
            <ProductsView />
          </ErrorBoundary>
        </Suspense>
      </div>
    </HydrationBoundary>
  );
};

export default page;
