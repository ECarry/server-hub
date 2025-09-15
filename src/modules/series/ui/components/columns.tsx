import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { seriesSelectSchema } from "@/db/schema";

export const columns: ColumnDef<z.infer<typeof seriesSelectSchema>>[] = [
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
    accessorKey: "brandLogoKey",
    header: "Logo",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        LOGO
        <p className="font-semibold">{row.original.name}</p>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
];
