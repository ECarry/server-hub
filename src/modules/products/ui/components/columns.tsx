import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import {
  IconDatabase,
  IconNetwork,
  IconPointFilled,
  IconServer,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import { DeleteProductButton } from "./delete-product-button";
import { ProductsGetManyOutput } from "../../types";

export const columns: ColumnDef<ProductsGetManyOutput["items"][number]>[] = [
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
        <div className="size-6 relative">
          <Image
            src={keyToUrl(row.original.brandLogoKey || "")}
            alt={row.original.brand}
            fill
            className="object-contain"
          />
        </div>
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
      <Badge className="px-1.5 capitalize">
        <IconPointFilled />
        {row.original.visibility}
      </Badge>
    ),
    enableHiding: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <DeleteProductButton productId={row.original.id} />,
    enableHiding: false,
  },
];
