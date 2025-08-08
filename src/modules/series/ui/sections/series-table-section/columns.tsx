/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Actions } from "./actions";
import { getFileUrl } from "@/modules/file-uploader/lib/utils";
import { SeriesGetManyOutput } from "@/modules/series/types";

export const columns: ColumnDef<SeriesGetManyOutput[number]>[] = [
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
        <img
          src={getFileUrl(row.original?.brandLogoKey || "")}
          alt={row.original?.brandName || ""}
          className="object-contain size-8"
        />
        <p className="font-semibold">{row.original?.brandName}</p>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions row={row} />,
  },
];
