/* eslint-disable @next/next/no-img-element */
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { s3Client as uploadClient } from "@/modules/s3/lib/upload-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

interface Props {
  productId: string;
}

export const ProductImageUploader = ({ productId }: Props) => {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIds, setUploadingIds] = useState<string[]>([]);

  const { data: images, refetch } = useQuery(
    trpc.products.getImages.queryOptions({
      productId,
    })
  );

  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );
  const createImage = useMutation(trpc.products.createImage.mutationOptions());
  const removeImage = useMutation(trpc.products.removeImage.mutationOptions());
  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      for (const file of files) {
        const tempId = crypto.randomUUID();
        setUploadingIds((prev) => [...prev, tempId]);

        try {
          // 1. Get Presigned URL
          const { uploadUrl, key } = await createPresignedUrl.mutateAsync({
            filename: file.name,
            contentType: file.type,
            size: file.size,
            folder: "products",
          });

          // 2. Upload to S3
          await uploadClient.upload({
            file,
            folder: "products",
            getUploadUrl: async () => ({ uploadUrl, publicUrl: "" }), // publicUrl not needed for upload
            onProgress: () => { }, // We could show progress if we wanted
          });

          // 3. Create Record in DB
          await createImage.mutateAsync({
            productId,
            imageKey: key,
            primary: false, // Default to false for now
          });

          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          console.error(error);
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          setUploadingIds((prev) => prev.filter((id) => id !== tempId));
        }
      }

      refetch();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageId: string, imageKey: string) => {
    try {
      // 1. Remove from DB
      await removeImage.mutateAsync({ id: imageId });

      // 2. Remove from S3 (Optional, but good practice to clean up)
      // Note: In some systems we might want to keep the file or soft delete. 
      // Here we'll delete it to save space.
      await deleteFile.mutateAsync({ key: imageKey });

      toast.success("Image deleted");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Images</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingIds.length > 0}
        >
          {uploadingIds.length > 0 ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Upload className="size-4 mr-2" />
          )}
          Upload Image
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images?.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-md overflow-hidden border bg-muted"
          >
            <img
              src={keyToUrl(image.imageKey)}
              alt="Product image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(image.id, image.imageKey)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {image.primary && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}
          </div>
        ))}

        {uploadingIds.map((id) => (
          <div
            key={id}
            className="aspect-square rounded-md overflow-hidden border bg-muted flex items-center justify-center"
          >
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ))}

        {images?.length === 0 && uploadingIds.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-md">
            No images uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};
