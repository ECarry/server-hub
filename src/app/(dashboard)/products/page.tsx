import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductsView,
  LoadingStatus,
  ErrorStatus,
} from "@/modules/products/ui/views/products-view";
import { loadSearchParams } from "@/modules/products/params";
import { ProductsListHeader } from "@/modules/products/ui/components/products-list-header";

type Props = {
  searchParams: Promise<SearchParams>;
};

const page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ ...filters })
  );

  return (
    <>
      <ProductsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingStatus />}>
          <ErrorBoundary fallback={<ErrorStatus />}>
            <ProductsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default page;
