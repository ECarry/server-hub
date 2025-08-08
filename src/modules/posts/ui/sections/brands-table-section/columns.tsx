/* eslint-disable @next/next/no-img-element */
import { brandsSelectSchema } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { getFileUrl } from "@/modules/file-uploader/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Actions } from "./actions";

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
      <img
        src={getFileUrl(row.original.logoImageKey || "")}
        alt={row.original.name}
        className="object-contain size-8"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
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
    cell: ({ row }) => <Actions row={row} />,
  },
];
