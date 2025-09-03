"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useBrandsFilters } from "@/modules/brands/hooks/use-brands-filters";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";

export const BrandsView = () => {
  const trpc = useTRPC();
  const [filters] = useBrandsFilters();

  const { data } = useSuspenseQuery(
    trpc.brands.getMany.queryOptions({ ...filters })
  );
  return (
    <div className="flex flex-1 flex-col">
      {/* <BrandCreateModal open={open} onOpenChange={setOpen} /> */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="w-full flex-col justify-start space-y-6">
            {/* <BrandCreateModal open={isOpen} onOpenChange={setIsOpen} /> */}
            <div className="flex items-center px-4 lg:px-6">
              <h1 className="text-2xl font-bold">Brands</h1>
              <div className="flex ml-auto items-center gap-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(true)}
                >
                  <IconPlus />
                  <span className="hidden lg:inline">Add Brand</span>
                </Button> */}
              </div>
            </div>
            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 mt-4">
              <div className="overflow-hidden rounded-lg border">
                <DataTable columns={columns} data={data.items} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
