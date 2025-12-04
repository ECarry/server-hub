"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { SeriesModal } from "./series-modal";

interface EditSeriesButtonProps {
  seriesId: string;
}

export const EditSeriesButton = ({ seriesId }: EditSeriesButtonProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <SeriesModal open={editOpen} onOpenChange={setEditOpen} seriesId={seriesId} />
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
