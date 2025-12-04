"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { DataPagination } from "@/components/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSeriesFilters } from "../../hooks/use-series-filters";

export const SeriesView = () => {
  const [filters, setFilters] = useSeriesFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.series.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* <BrandCreateModal open={open} onOpenChange={setOpen} /> */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="w-full flex-col justify-start space-y-6">
            {/* <BrandCreateModal open={isOpen} onOpenChange={setIsOpen} /> */}
            <div className="flex items-center px-4 lg:px-6">
              {/* <h1 className="text-2xl font-bold">Series</h1> */}
              <div className="flex ml-auto items-center gap-2">
                {/* <SeriesSearchFilter /> */}
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
              <div className="overflow-hidden rounded-lg">
                <DataTable columns={columns} data={data.items} />
              </div>
              <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => {
                  setFilters({ page });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SeriesViewSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="w-full flex-col justify-start space-y-6">
            <div className="flex items-center px-4 lg:px-6">
              <h1 className="text-2xl font-bold">Brands</h1>
              <div className="flex ml-auto items-center gap-2"></div>
            </div>
            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 mt-4">
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    <TableRow>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <TableHead key={index}>
                          <Skeleton className="h-8 w-24" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="**:data-[slot=table-cell]:first:w-8">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 5 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-8 w-24" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
