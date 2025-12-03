"use client";

import { useState } from "react";
import { ProductCreateModal } from "../components/product-create-modal";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useBrandsFilters } from "@/modules/brands/hooks/use-brands-filters";

export const ProductsView = () => {
  const [filters] = useBrandsFilters();
  const [open, setOpen] = useState(false);

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({ ...filters })
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <ProductCreateModal open={open} onOpenChange={setOpen} />
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="w-full flex-col justify-start space-y-6">
            <div className="flex items-center px-4 lg:px-6">
              <h1 className="text-2xl font-bold">Products</h1>
              <div className="flex ml-auto items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                >
                  <IconPlus />
                  <span className="hidden lg:inline">Add Product</span>
                </Button>
              </div>
            </div>
            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 mt-4">
              <DataTable columns={columns} data={data.items} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductsViewSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <ProductCreateModal open={false} onOpenChange={() => {}} />
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"></div>
      </div>
    </div>
  );
};
