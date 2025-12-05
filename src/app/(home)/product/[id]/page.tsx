import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { trpc, getQueryClient } from "@/trpc/server";
import { ProductIdView, ProductIdViewLoading } from "@/modules/home/ui/views/product-id-view";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const queryClient = getQueryClient();
  const product = await queryClient.fetchQuery(trpc.home.getProductById.queryOptions(id));

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.brand} ${product.model} - ${product.series}`,
    description: product.description || `Explore details for ${product.brand} ${product.model}`,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.home.getProductById.queryOptions(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="w-full grid grid-cols-[min-content_auto_min-content] grid-rows-[1fr_auto] gap-x-4 md:grid-cols-[1fr_minmax(auto,1200px)_1fr] px-5 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8">
        <div className="col-start-2">
          <Suspense fallback={<ProductIdViewLoading />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <ProductIdView productId={id} />
            </ErrorBoundary>
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
}
