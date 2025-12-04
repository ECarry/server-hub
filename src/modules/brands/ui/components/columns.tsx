import { brandsSelectSchema } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { DeleteBrandButton } from "./delete-brand-button";
import { EditBrandButton } from "./edit-brand-button";
import Image from "next/image";

export const columns: ColumnDef<z.infer<typeof brandsSelectSchema>>[] = [
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
    accessorKey: "logoImageKey",
    header: "Logo",
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-10 h-10 relative">
        <Image
          src={keyToUrl(row.original.logoImageKey) ?? ""}
          alt="brand logo"
          fill
          className="object-contain"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <p>{row.original.name}</p>
      </div>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.fullName}
      </Badge>
    ),
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <EditBrandButton brand={row.original} />
        <DeleteBrandButton brandId={row.original.id} />
      </div>
    ),
    enableHiding: false,
  },
];
