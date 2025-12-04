"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { BrandModal } from "./brand-modal";
import { brandsSelectSchema } from "@/db/schema";
import { z } from "zod";

interface EditBrandButtonProps {
  brand: z.infer<typeof brandsSelectSchema>;
}

export const EditBrandButton = ({ brand }: EditBrandButtonProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <BrandModal
        open={editOpen}
        onOpenChange={setEditOpen}
        brandId={brand.id}
        initialData={{
          name: brand.name,
          fullName: brand.fullName,
          description: brand.description,
          logoImageKey: brand.logoImageKey,
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
