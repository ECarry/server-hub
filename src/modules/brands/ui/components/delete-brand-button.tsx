"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteBrandButtonProps {
  brandId: string;
}

export const DeleteBrandButton = ({ brandId }: DeleteBrandButtonProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure you want to delete this brand?"
  );
  const removeBrand = useMutation(
    trpc.brands.remove.mutationOptions({
      onSuccess: async () => {
        toast.success("Brand deleted successfully");
        await queryClient.invalidateQueries(
          trpc.brands.getMany.queryOptions({})
        );
      },
      onError: () => {
        toast.error("Failed to delete brand");
      },
    })
  );

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    await removeBrand.mutateAsync({ id: brandId });
  };

  return (
    <>
      <ConfirmDialog />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        disabled={removeBrand.isPending}
      >
        <Trash2 className="size-4" />
      </Button>
    </>
  );
};
