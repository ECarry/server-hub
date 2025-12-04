/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { SeriesGetMany } from "@/modules/series/types";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { DeleteSeriesButton } from "./delete-series-button";
import { EditSeriesButton } from "./edit-series-button";

export const columns: ColumnDef<SeriesGetMany["items"][number]>[] = [
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
        <div className="size-10">
          <img
            src={keyToUrl(row.original.brandLogoKey) ?? ""}
            alt="brand logo"
            className="object-cover"
          />
        </div>
        <p className="font-semibold">{row.original.brandName}</p>
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
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <EditSeriesButton series={row.original} />
        <DeleteSeriesButton seriesId={row.original.id} />
      </div>
    ),
    enableHiding: false,
  },
];
