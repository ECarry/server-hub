"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteProductButtonProps {
  productId: string;
}

export const DeleteProductButton = ({
  productId,
}: DeleteProductButtonProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure you want to delete this product?"
  );
  const removeProduct = useMutation(
    trpc.products.remove.mutationOptions({
      onSuccess: async () => {
        toast.success("Product deleted successfully");
        await queryClient.invalidateQueries(
          trpc.products.getMany.queryOptions({})
        );
      },
      onError: () => {
        toast.error("Failed to delete product");
      },
    })
  );

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    await removeProduct.mutateAsync({ id: productId });
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
        disabled={removeProduct.isPending}
      >
        <Trash2 className="size-4" />
      </Button>
    </>
  );
};
