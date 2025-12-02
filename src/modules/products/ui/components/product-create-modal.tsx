/* eslint-disable @next/next/no-img-element */
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { productsInsertSchema } from "@/db/schema";
import { Textarea } from "@/components/ui/textarea";

import { IconDatabase, IconNetwork, IconServer } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductCreateModal = ({ open, onOpenChange }: Props) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const form = useForm<z.infer<typeof productsInsertSchema>>({
    resolver: zodResolver(productsInsertSchema),
    defaultValues: {
      model: "",
      brandId: "",
      categoryId: "",
      generation: "",
    },
  });

  const trpc = useTRPC();
  const { data: brands } = useQuery(trpc.brands.getMany.queryOptions({}));
  const { data: series } = useQuery(trpc.series.getMany.queryOptions());
  const { data: categories } = useQuery(trpc.products.getManyCategories.queryOptions());

  // series brand id === selectedBrandId
  const filteredSeries = useMemo(() => {
    if (!series || !selectedBrandId) return [];
    return series.filter((s) => s.brandId === selectedBrandId);
  }, [series, selectedBrandId]);


  const create = useMutation(trpc.products.create.mutationOptions());

  const onSubmit = async (data: z.infer<typeof productsInsertSchema>) => {
    create.mutateAsync(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedBrandId(null);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={handleClose}
      title="Create a Product"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="w-full flex gap-2">
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Brand</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedBrandId(value);
                    }}
                    defaultValue={field.value}
                  >
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
              name="seriesId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Series</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a series" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSeries.length > 0 ? (
                        filteredSeries?.map((series) => (
                          <SelectItem key={series.id} value={series.id}>
                            {series.name}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm px-2 py-1">
                          No series available
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex items-center gap-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name === "server" && (
                            <IconServer className="size-5" />
                          )}
                          {category.name === "network" && (
                            <IconNetwork className="size-5" />
                          )}
                          {category.name === "storage" && (
                            <IconDatabase className="size-5" />
                          )}
                          <p className="capitalize">{category.name}</p>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generation"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Generation</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter generation"
                      {...field}
                      value={field.value || ""}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter model"
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
                    placeholder="Enter brand description"
                    {...field}
                    className="w-full"
                    value={field.value || ""}
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
