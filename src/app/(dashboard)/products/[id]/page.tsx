import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  ProductIdView,
  LoadingSkeleton
} from "@/modules/products/ui/views/product-id-view";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.products.getOne.queryOptions({
    id: (await params).id
  }));
  void queryClient.prefetchQuery(trpc.products.getCategories.queryOptions());
  void queryClient.prefetchQuery(trpc.brands.getMany.queryOptions({}));
  void queryClient.prefetchQuery(trpc.series.getMany.queryOptions({}));
  void queryClient.prefetchQuery(trpc.products.getDocumentations.queryOptions({
    productId: (await params).id
  }));
  void queryClient.prefetchQuery(trpc.products.getImages.queryOptions({
    productId: (await params).id
  }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LoadingSkeleton />}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <ProductIdView productId={(await params).id} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;
