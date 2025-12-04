"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteSeriesButtonProps {
  seriesId: string;
}

export const DeleteSeriesButton = ({ seriesId }: DeleteSeriesButtonProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure you want to delete this series?"
  );
  const removeSeries = useMutation(
    trpc.series.remove.mutationOptions({
      onSuccess: async () => {
        toast.success("Series deleted successfully");
        await queryClient.invalidateQueries(
          trpc.series.getMany.queryOptions({})
        );
      },
      onError: () => {
        toast.error("Failed to delete series");
      },
    })
  );

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    await removeSeries.mutateAsync({ id: seriesId });
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
        disabled={removeSeries.isPending}
      >
        <Trash2 className="size-4" />
      </Button>
    </>
  );
};
