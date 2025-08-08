/* eslint-disable @next/next/no-img-element */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { seriesInsertSchema } from "@/db/schema";
import { getFileUrl } from "@/modules/file-uploader/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SeriesCreateModal = ({ open, onOpenChange }: Props) => {
  const form = useForm<z.infer<typeof seriesInsertSchema>>({
    resolver: zodResolver(seriesInsertSchema),
    defaultValues: {
      name: "",
      brandId: "",
    },
  });

  const utils = trpc.useUtils();
  const { data: brands } = trpc.brands.getMany.useQuery();
  const create = trpc.series.create.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      utils.series.getMany.invalidate();
      toast.success("Series created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof seriesInsertSchema>) => {
    create.mutateAsync(data);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a Series"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    {brands?.map((brand) => (
                      <SelectItem
                        key={brand.id}
                        value={brand.id}
                        className="flex items-center gap-2"
                      >
                        <img
                          src={getFileUrl(brand.logoImageKey || "")}
                          alt={brand.name}
                          className="size-6 object-contain"
                        />
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
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

          <Button disabled={create.isPending} type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
