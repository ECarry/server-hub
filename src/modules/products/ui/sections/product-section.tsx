/* eslint-disable @next/next/no-img-element */
"use client";

import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/modules/file-uploader/lib/utils";
import { trpc } from "@/trpc/client";
import { format, formatDistanceToNow } from "date-fns";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
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
import { ImageDropzone } from "@/modules/file-uploader/ui/components/image-dropzone";
import { cloudflareR2 } from "@/modules/file-uploader/lib/cloudflare-r2";
import { ProductImagesCarousel } from "@/modules/product-images/ui/components/product-images-carousel";
import { DocumentUploaderModal } from "@/modules/documentation/ui/components/document-uploader-modal";
import { FilesAccordion } from "@/components/files-accordion";

interface Props {
  productId: string;
}

export const ProductSection = ({ productId }: Props) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ProductSectionSuspense productId={productId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const ProductSectionSuspense = ({ productId }: Props) => {
  const [documentUploaderOpen, setDocumentUploaderOpen] = useState(false);

  const utils = trpc.useUtils();
  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      utils.products.getOne.invalidate({ id: productId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const [data] = trpc.products.getOne.useSuspenseQuery({ id: productId });
  const [brands] = trpc.brands.getMany.useSuspenseQuery();
  const [series] = trpc.series.getMany.useSuspenseQuery();
  const [categories] = trpc.productCategories.getMany.useSuspenseQuery();
  const [documents] = trpc.documentation.getMany.useSuspenseQuery({
    productId,
  });
  const [images] = trpc.productImages.getMany.useSuspenseQuery({
    productId,
  });
  const createProductImage = trpc.productImages.create.useMutation({
    onSuccess: () => {
      toast.success("Image uploaded successfully");
      utils.productImages.getMany.invalidate({ productId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const createPresignedUrl = trpc.filesUpload.createPresignedUrl.useMutation();

  const form = useForm<z.infer<typeof productsUpdateSchema>>({
    resolver: zodResolver(productsUpdateSchema),
    defaultValues: {
      ...data,
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

    try {
      const result = await cloudflareR2.upload({
        file,
        folder: "product-images",
        getUploadUrl: async (input) => {
          const data = await createPresignedUrl.mutateAsync(input);
          return {
            uploadUrl: data.uploadUrl,
            publicUrl: data.publicUrl,
            fileKey: data.fileKey,
          };
        },
      });

      await createProductImage.mutateAsync({
        productId,
        imageKey: result.fileKey,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <>
      <DocumentUploaderModal
        open={documentUploaderOpen}
        onOpenChange={setDocumentUploaderOpen}
        productId={productId}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <h1 className="text-3xl">
                  {data.brand +
                    " " +
                    data.series +
                    " " +
                    data.model +
                    " " +
                    data.generation}
                </h1>
                <Badge variant={data.visibility} className="px-1.5 capitalize">
                  <IconPointFilled />
                  {data.visibility}
                </Badge>
              </div>
              <div className="flex items-center gap-x-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {format(new Date(data.createdAt), "d MMM, yyyy")}
                </p>
                <p className="text-muted-foreground text-sm">・</p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>{" "}
                  {formatDistanceToNow(data.updatedAt)}
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
                <ImageDropzone onUpload={handleImageUpload} />

                <ProductImagesCarousel images={images} />
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
                  <FilesAccordion documents={documents} />
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
                            {series?.map((s) => (
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

                <h2 className="text-muted-foreground">Manage Info</h2>
                <FormField
                  control={form.control}
                  name="managementIp"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Default Management IP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter ip address"
                          {...field}
                          value={field.value || ""}
                          className="w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-x-2">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter username"
                            {...field}
                            value={field.value || ""}
                            className="w-full"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userPassword"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter password"
                            {...field}
                            value={field.value || ""}
                            className="w-full"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
