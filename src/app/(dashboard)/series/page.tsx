import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";
import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  SeriesView,
  SeriesViewSkeleton,
} from "@/modules/series/ui/views/series-view";
import { loadSearchParams } from "@/modules/series/params";

type Props = {
  searchParams: Promise<SearchParams>;
};

const page = async ({ searchParams }: Props) => {
  const filters = await loadSearchParams(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.series.getMany.queryOptions({ ...filters })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<SeriesViewSkeleton />}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <SeriesView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;
