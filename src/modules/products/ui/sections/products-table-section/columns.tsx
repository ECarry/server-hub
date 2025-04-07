/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getFileUrl } from "@/modules/filesUpload/lib/utils";
import { ProductsGetManyOutput } from "@/modules/products/types";
import {
  IconDatabase,
  IconEye,
  IconEyeX,
  IconLoader,
  IconNetwork,
  IconServer,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const columns: ColumnDef<ProductsGetManyOutput[number]>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img
          src={getFileUrl(row.original.brandLogoKey || "")}
          alt={row.original.brand}
          className="size-6 object-contain"
        />
        <p>{row.original.brand}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "series",
    header: "Series",
    enableHiding: false,
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => (
      <Link href={`/products/${row.original.id}`} className="group">
        <p className="ml-2 group-hover:underline underline-offset-4">
          {row.original.model}
        </p>
      </Link>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "generation",
    header: "Generation",
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <>
        {row.original.category === "server" ? (
          <IconServer className="size-4" />
        ) : row.original.category === "storage" ? (
          <IconDatabase className="size-4" />
        ) : (
          <IconNetwork className="size-4" />
        )}
      </>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <p className="text-muted-foreground px-1.5 truncate max-w-64">
        {row.original.description}
      </p>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-muted-foreground px-1.5">
        {row.original.visibility === "public" ? (
          <IconEye />
        ) : row.original.visibility === "private" ? (
          <IconEyeX />
        ) : (
          <IconLoader />
        )}
        {row.original.visibility}
      </Badge>
    ),
    enableHiding: false,
  },
];
