"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { brandsInsertSchema } from "@/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploaderButton } from "@/modules/file-uploader/ui/components/image-uploader-button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BrandCreateModal = ({ open, onOpenChange }: Props) => {
  const form = useForm<z.infer<typeof brandsInsertSchema>>({
    resolver: zodResolver(brandsInsertSchema),
    defaultValues: {
      name: "",
      fullName: "",
      description: "",
      logoImageKey: "",
    },
  });

  const utils = trpc.useUtils();
  const create = trpc.brands.create.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      utils.brands.getMany.invalidate();
      toast.success("Brand created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof brandsInsertSchema>) => {
    create.mutateAsync(data);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a Brand"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
            name="fullName"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand full name"
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
            name="description"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter brand description"
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
            name="logoImageKey"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Brand Logo</FormLabel>
                <FormControl>
                  <ImageUploaderButton
                    imageKey={field.value}
                    onUpload={(key) => field.onChange(key)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={create.isPending} type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
