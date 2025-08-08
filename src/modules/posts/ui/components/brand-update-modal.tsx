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
import { brandsSelectSchema } from "@/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploaderButton } from "@/modules/file-uploader/ui/components/image-uploader-button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: z.infer<typeof brandsSelectSchema>;
}

export const BrandUpdateModal = ({ open, onOpenChange, brand }: Props) => {
  const form = useForm<z.infer<typeof brandsSelectSchema>>({
    resolver: zodResolver(brandsSelectSchema),
    defaultValues: {
      id: brand.id,
      name: brand.name,
      fullName: brand.fullName,
      description: brand.description,
      logoImageKey: brand.logoImageKey,
    },
  });

  const utils = trpc.useUtils();
  const update = trpc.brands.update.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      utils.brands.getMany.invalidate();
      toast.success("Brand updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof brandsSelectSchema>) => {
    console.log(data);
    update.mutateAsync({
      ...data,
    });
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Update a Brand"
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
          <Button disabled={update.isPending} type="submit" className="w-full">
            Update
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
