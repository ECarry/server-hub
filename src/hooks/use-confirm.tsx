import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { JSX, useState } from "react";

export const useConfirm = (
  title: string
): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleCancel = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const ConfirmationDialog = () => {
    return (
      <ResponsiveModal
        open={promise !== null}
        onOpenChange={handleClose}
        title={title}
      >
        <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full lg:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="w-full lg:w-auto">
            Confirm
          </Button>
        </div>
      </ResponsiveModal>
    );
  };

  return [ConfirmationDialog, confirm];
};
