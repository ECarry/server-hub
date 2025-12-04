"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { SeriesModal } from "./series-modal";
import { SeriesGetMany } from "@/modules/series/types";

interface EditSeriesButtonProps {
  series: SeriesGetMany["items"][number];
}

export const EditSeriesButton = ({ series }: EditSeriesButtonProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <SeriesModal
        open={editOpen}
        onOpenChange={setEditOpen}
        seriesId={series.id}
        initialData={{
          name: series.name,
          brandId: series.brandId,
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="size-4" />
      </Button>
    </>
  );
};
