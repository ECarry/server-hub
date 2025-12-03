/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
"use client";

import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productsUpdateSchema } from "@/db/schema";
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
  IconPlus,
  IconServer,
  IconPointFilled,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

interface Props {
  productId: string;
}

export const ProductIdView = ({ productId }: Props) => {
  const [documentUploaderOpen, setDocumentUploaderOpen] = useState(false);

  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({
      id: productId,
    })
  );
  const { data: brands } = useQuery(trpc.brands.getMany.queryOptions({}));
  const { data: series } = useQuery(trpc.series.getMany.queryOptions({}));
  const { data: categories } = useQuery(
    trpc.products.getCategories.queryOptions()
  );

  const updateProduct = useMutation(trpc.products.update.mutationOptions());
  const createProductImage = useMutation(
    trpc.products.createImage.mutationOptions()
  );
  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const form = useForm<z.infer<typeof productsUpdateSchema>>({
    // @ts-expect-error
    resolver: zodResolver(productsUpdateSchema),
    // @ts-expect-error
    defaultValues: {
      ...product,
    },
  });

  const onSubmit = (values: z.infer<typeof productsUpdateSchema>) => {
    console.log(values);
    updateProduct.mutate({
      ...values,
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) {
      return;
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <h1 className="text-3xl">
                  {product.brand +
                    " " +
                    product.series +
                    " " +
                    product.model +
                    " " +
                    product.generation}
                </h1>
                <Badge className="px-1.5 capitalize">
                  <IconPointFilled />
                  {product.visibility}
                </Badge>
              </div>
              <div className="flex items-center gap-x-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {format(new Date(product.createdAt), "d MMM, yyyy")}
                </p>
                <p className="text-muted-foreground text-sm">・</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>{" "}
                  {formatDistanceToNow(product.updatedAt)}
                </p>
              </div>
            </div>
            {/* Button */}
            <div className="flex items-center gap-x-2">
              <Button
                disabled={updateProduct.isPending}
                type="submit"
                variant="default"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Image & Description */}

            <div className="basis-1 md:basis-1/2 2xl:basis-2/3 flex flex-col gap-y-4 w-full">
              {/* IMAGE */}
              <div className="flex items-center gap-x-2">
                {/* <ImageDropzone onUpload={handleImageUpload} />

                  <ProductImagesCarousel images={product.images} /> */}
              </div>

              {/* DESCRIPTION */}
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description"
                          className="h-40"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="w-full mt-10" />

              {/* DOCUMENTATION */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-muted-foreground text-lg">
                    Documentation
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    className="size-8 rounded-full"
                    onClick={() => setDocumentUploaderOpen(true)}
                  >
                    <IconPlus className="text-muted-foreground" />
                  </Button>
                </div>

                <div className="space-y-4 mt-2">
                  {/* <FilesAccordion documents={documents} /> */}
                </div>
              </div>

              <Separator className="w-full mt-10" />

              {/* Download */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-muted-foreground text-lg">Download</h2>
                  <Button
                    type="button"
                    variant="outline"
                    className="size-8 rounded-full"
                  >
                    <IconPlus className="text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <Separator orientation="vertical" />
            </div>

            {/* Product Form */}
            <div className="basis-1 md:basis-1/2 2xl:basis-1/3 flex flex-col gap-y-4 border p-4 rounded-md">
              <h3 className="text-lg">Product Edit</h3>
              <h2 className="text-muted-foreground">Product Info</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-x-2">
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
                            {series?.items.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-x-2">
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
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Visibility</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">
                              <IconEdit className="size-5" />
                              Draft
                            </SelectItem>
                            <SelectItem value="public">
                              <IconEye className="size-5" />
                              Public
                            </SelectItem>
                            <SelectItem value="private">
                              <IconEyeClosed className="size-5" />
                              Private
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter model"
                          {...field}
                          value={field.value}
                          className="w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
