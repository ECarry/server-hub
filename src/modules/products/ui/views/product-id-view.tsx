"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { format, formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  IconDatabase,
  IconEdit,
  IconEye,
  IconEyeClosed,
  IconNetwork,
  IconServer,
  IconPointFilled,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { ProductImageUploader } from "../components/product-image-uploader";
import { ProductDocuments } from "../components/product-documents";
import { ProductDownloads } from "../components/product-downloads";
import { ProductUpdateInput, productUpdateSchema } from "../../schemas";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Props {
  productId: string;
}

export const ProductIdView = ({ productId }: Props) => {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({
      id: productId,
    })
  );
  const { data: brands } = useSuspenseQuery(
    trpc.brands.getMany.queryOptions({})
  );
  const { data: series } = useSuspenseQuery(
    trpc.series.getMany.queryOptions({})
  );
  const { data: categories } = useSuspenseQuery(
    trpc.products.getCategories.queryOptions()
  );

  const updateProduct = useMutation(trpc.products.update.mutationOptions());

  const form = useForm<ProductUpdateInput>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      id: productId,
      model: product.model,
      brandId: product.brandId,
      categoryId: product.categoryId,
      seriesId: product.seriesId || undefined,
      generation: product.generation || undefined,
      description: product.description || undefined,
      visibility: product.visibility,
    },
  });

  const onSubmit = (values: ProductUpdateInput) => {
    updateProduct.mutate(values);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-x-3">
                <h1 className="text-2xl font-semibold">
                  {product.brand +
                    " " +
                    (product.series ? product.series + " " : "") +
                    product.model +
                    " " +
                    (product.generation || "")}
                </h1>
                <Badge
                  variant={
                    product.visibility === "public" ? "default" : "secondary"
                  }
                  className="px-2 py-0.5 capitalize flex items-center gap-1"
                >
                  {product.visibility === "public" && (
                    <IconPointFilled className="size-3" />
                  )}
                  {product.visibility}
                </Badge>
              </div>
              <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
                <p>
                  Created {format(new Date(product.createdAt), "d MMM yyyy")}
                </p>
                <span>•</span>
                <p>Last Updated {formatDistanceToNow(product.updatedAt)} ago</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Left Column - Main Content */}
            <div className="flex-1 flex flex-col gap-y-8 min-w-0">
              {/* Images */}
              <div>
                <ProductImageUploader productId={productId} />
              </div>

              <Separator />

              {/* Description */}
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description"
                          className="h-40 resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Documentation */}
              <div>
                <ProductDocuments productId={productId} />
              </div>

              {/* Downloads */}
              <div>
                <ProductDownloads productId={productId} />
              </div>
            </div>

            <div className="hidden xl:block">
              <Separator orientation="vertical" className="h-full" />
            </div>

            {/* Right Column - Product Organization */}
            <div className="w-full xl:w-[400px] flex flex-col gap-y-6">
              <div className="border p-6 rounded-lg space-y-6 bg-card">
                <h3 className="text-lg font-semibold">Product Info</h3>

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Generation</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands?.items.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              <div className="flex items-center gap-2">
                                {brand.logoImageKey && (
                                  <Image
                                    src={keyToUrl(brand.logoImageKey)}
                                    alt={brand.name}
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                  />
                                )}
                                {brand.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a series" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {series?.items.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                {category.name === "server" && (
                                  <IconServer className="size-4" />
                                )}
                                {category.name === "network" && (
                                  <IconNetwork className="size-4" />
                                )}
                                {category.name === "storage" && (
                                  <IconDatabase className="size-4" />
                                )}
                                <span className="capitalize">
                                  {category.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center gap-2">
                              <IconEdit className="size-4" />
                              Draft
                            </div>
                          </SelectItem>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <IconEye className="size-4" />
                              Public
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <IconEyeClosed className="size-4" />
                              Private
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={updateProduct.isPending}
                onClick={form.handleSubmit(onSubmit)}
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const LoadingSkeleton = () => {
  return (
    <div className="max-w-[1600px] w-full mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-x-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Column Skeleton */}
        <div className="flex-1 flex flex-col gap-y-8 min-w-0">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-40 w-full rounded-md" />
          </div>

          <Separator />

          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-36" />
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden xl:block">
          <Separator orientation="vertical" className="h-full" />
        </div>

        {/* Right Column Skeleton */}
        <div className="w-full xl:w-[400px] flex flex-col gap-y-6">
          <div className="border p-6 rounded-lg space-y-6 bg-card">
            <Skeleton className="h-6 w-32" />

            {/* Form Fields */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};
