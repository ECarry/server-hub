import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  BrandsView,
  BrandsViewSkeleton,
} from "@/modules/brands/ui/views/brands-view";
import { ErrorStatus } from "@/modules/products/ui/views/products-view";
import { loadSearchParams } from "@/modules/brands/params";
import { BrandsListHeader } from "@/modules/brands/ui/components/brands-list-header";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.brands.getMany.queryOptions({ ...filters })
  );

  return (
    <>
      <BrandsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BrandsViewSkeleton />}>
          <ErrorBoundary fallback={<ErrorStatus />}>
            <BrandsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
