/* eslint-disable @next/next/no-img-element */
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ResponsiveModal } from "@/components/responsive-modal";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId?: string;
  initialData?: {
    name: string;
    brandId: string;
  };
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brandId: z.string().uuid("Brand is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const SeriesModal = ({ open, onOpenChange, seriesId, initialData }: Props) => {
  const isEditMode = !!seriesId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brandId: "",
    },
  });

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: brands } = useQuery(trpc.brands.getMany.queryOptions({}));

  // Update form when modal opens with initial data
  useEffect(() => {
    if (initialData && isEditMode && open) {
      form.reset({
        name: initialData.name || "",
        brandId: initialData.brandId || "",
      });
    }
  }, [initialData, isEditMode, open, form]);

  const create = useMutation(
    trpc.series.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Series created successfully");
        handleClose();
        await queryClient.invalidateQueries(
          trpc.series.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const update = useMutation(
    trpc.series.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Series updated successfully");
        handleClose();
        await queryClient.invalidateQueries(
          trpc.series.getMany.queryOptions({})
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const onSubmit = (data: FormValues) => {
    if (isEditMode && seriesId) {
      update.mutate({ id: seriesId, ...data });
    } else {
      create.mutate(data);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? "Edit Series" : "Create a Series"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    {brands?.items.map((brand) => (
                      <SelectItem
                        key={brand.id}
                        value={brand.id}
                        className="flex items-center gap-2"
                      >
                        <img
                          src={keyToUrl(brand.logoImageKey || "")}
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
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter series name"
                    {...field}
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            disabled={create.isPending || update.isPending}
            type="submit"
            className="w-full"
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
