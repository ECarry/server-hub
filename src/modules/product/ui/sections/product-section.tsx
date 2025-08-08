/* eslint-disable @next/next/no-img-element */
"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileUrl } from "@/modules/file-uploader/lib/utils";
import { useSave } from "@/modules/save-product/hooks/use-save";
import { SaveButton } from "@/modules/save-product/ui/components/save-button";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  productId: string;
}

export const ProductSection = ({ productId }: Props) => {
  return (
    <Suspense fallback={<ProductLoadingSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ProductsSectionSuspense productId={productId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ProductLoadingSkeleton = () => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col gap-y-6">
        <div className="size-16 md:size-24 rounded-3xl overflow-hidden border p-2 flex items-center justify-center bg-muted">
          <Skeleton className="size-full" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-100" />
        </div>
        <Skeleton className="w-full h-11 flex items-center bg-muted rounded-2xl px-4 gap-2" />
      </div>
    </div>
  );
};

const ProductsSectionSuspense = ({ productId }: Props) => {
  const [data] = trpc.product.getOne.useSuspenseQuery({
    id: productId,
  });

  const { data: user } = trpc.users.getOne.useQuery({
    productId,
  });

  const { isPending, onClick } = useSave({
    productId,
    isSaved: user?.productSaved || false,
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-y-6">
        {/* Logo */}
        <div className="size-16 md:size-24 rounded-3xl overflow-hidden border p-2 flex items-center justify-center bg-muted">
          <img
            src={getFileUrl(data?.brandLogoKey || "")}
            alt="logo"
            className="object-contain"
          />
        </div>
        {/* Title */}
        <div className="flex flex-col space-y-2">
          <div className="text-3xl md:text-4xl font-bold">
            {data?.model} {data?.generation}
          </div>
          <div className="text-3xl md:text-4xl font-bold">
            {data?.brandFullName} {data?.series}
          </div>
        </div>
        {/* Pro */}
        <div className="w-full h-11 flex items-center bg-muted rounded-2xl px-4 gap-2">
          <Badge>PRO</Badge>
          <span className="text-sm font-semibold">
            Get full access to — Upgrade to Pro
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-muted-foreground text-sm">Category</h3>
        <Link
          href=""
          className="font-semibold hover:underline underline-offset-2 capitalize"
        >
          {data?.category}
        </Link>
      </div>
      <div>
        <SaveButton
          onClick={onClick}
          disabled={isPending}
          isSaved={user?.productSaved || false}
          className="rounded-full px-4 text-base"
          size="lg"
        />
      </div>
    </div>
  );
};
