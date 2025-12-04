"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useBrandsFilters } from "@/modules/brands/hooks/use-brands-filters";
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

export const BrandsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useBrandsFilters();

  const { data } = useSuspenseQuery(
    trpc.brands.getMany.queryOptions({ ...filters })
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
        <EmptyTitle>No brands found</EmptyTitle>
        <EmptyDescription>
          You have no brands. Create a new brand to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
};

export const BrandsViewSkeleton = () => {
  return (
    <div className="px-4 md:px-8 space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead><Checkbox /></TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                {Array.from({ length: 4 }).map((_, cellIndex) => (
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
