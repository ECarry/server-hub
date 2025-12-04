import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  SeriesView,
  SeriesViewSkeleton,
} from "@/modules/series/ui/views/series-view";
import { ErrorStatus } from "@/modules/products/ui/views/products-view";
import { loadSearchParams } from "@/modules/series/params";
import { SeriesListHeader } from "@/modules/series/ui/components/series-list-header";

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
    trpc.series.getMany.queryOptions({ ...filters })
  );

  return (
    <>
      <SeriesListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SeriesViewSkeleton />}>
          <ErrorBoundary fallback={<ErrorStatus />}>
            <SeriesView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
