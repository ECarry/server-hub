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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconPhotoOff } from "@tabler/icons-react";
import { Activity } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export const SeriesView = () => {
  const [filters, setFilters] = useSeriesFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.series.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="px-4 md:px-8">
      <Activity mode={data.total === 0 ? "hidden" : "visible"}>
        <DataTable columns={columns} data={data.items} />
        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={(page) => {
            setFilters({ page });
          }}
        />
      </Activity>

      <Activity mode={data.total !== 0 ? "hidden" : "visible"}>
        <EmptyStatus />
      </Activity>
    </div>
  );
};

const EmptyStatus = () => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconPhotoOff />
        </EmptyMedia>
        <EmptyTitle>No series found</EmptyTitle>
        <EmptyDescription>
          You have no series. Create a new series to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
};

export const SeriesViewSkeleton = () => {
  return (
    <div className="px-4 md:px-8 space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead><Checkbox /></TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                {Array.from({ length: 2 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};
