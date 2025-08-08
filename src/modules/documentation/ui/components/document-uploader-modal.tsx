import { ResponsiveModal } from "@/components/responsive-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentsInsertSchema } from "@/db/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { UploaderButton } from "@/modules/file-uploader/ui/components/uploader-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export const DocumentUploaderModal = ({
  open,
  onOpenChange,
  productId,
}: Props) => {
  const utils = trpc.useUtils();
  const createDocument = trpc.documentation.create.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      toast.success("Document created successfully");
      utils.documentation.getMany.invalidate({ productId });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create document"
      );
    },
  });
  const form = useForm<z.infer<typeof documentsInsertSchema>>({
    resolver: zodResolver(documentsInsertSchema),
    defaultValues: {
      productId,
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof documentsInsertSchema>) => {
    createDocument.mutate(values);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Document Uploader"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand name"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description"
                    {...field}
                    className="w-full"
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fileKey"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Document</FormLabel>
                <FormControl>
                  <UploaderButton
                    folder="documents"
                    onUpload={(key) => field.onChange(key)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            disabled={createDocument.isPending}
            type="submit"
            className="w-full"
          >
            Create
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
