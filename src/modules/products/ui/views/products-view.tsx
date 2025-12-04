"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataPagination } from "@/components/data-table-pagination";
import { useProductsFilters } from "../../hooks/use-products-filters";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconPhotoOff } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useErrorBoundary } from "react-error-boundary";
import { Activity } from "react";

export const ProductsView = () => {
  const [filters, setFilters] = useProductsFilters();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getMany.queryOptions({ ...filters })
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
        <EmptyTitle>No products found</EmptyTitle>
        <EmptyDescription>
          You have no products. Create a new product to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
};

export const ErrorStatus = () => {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div className="px-4 md:px-8">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconAlertTriangle />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>Please try again later.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={resetBoundary}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
};

export const LoadingStatus = () => {
  return (
    <div className="px-4 md:px-8 space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Gen</TableHead>
              <TableHead className="text-right">Category</TableHead>
              <TableHead className="text-right">Description</TableHead>
              <TableHead className="text-right pr-6">Visibility</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-xs truncate">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
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
