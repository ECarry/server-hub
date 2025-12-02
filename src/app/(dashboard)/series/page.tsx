import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  SeriesView,
  SeriesViewSkeleton,
} from "@/modules/series/ui/views/series-view";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.series.getMany.queryOptions());

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
