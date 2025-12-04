"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { BrandModal } from "./brand-modal";

interface EditBrandButtonProps {
  brandId: string;
}

export const EditBrandButton = ({ brandId }: EditBrandButtonProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <BrandModal open={editOpen} onOpenChange={setEditOpen} brandId={brandId} />
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
