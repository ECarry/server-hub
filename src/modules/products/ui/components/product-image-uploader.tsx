/* eslint-disable @next/next/no-img-element */
"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { useFileUpload } from "@/modules/s3/hooks/use-file-upload";

interface Props {
  productId: string;
}

export const ProductImageUploader = ({ productId }: Props) => {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploadingFiles, isUploading } = useFileUpload();

  const { data: images, refetch } = useSuspenseQuery(
    trpc.products.getImages.queryOptions({
      productId,
    })
  );

  const createImage = useMutation(trpc.products.createImage.mutationOptions());
  const removeImage = useMutation(trpc.products.removeImage.mutationOptions());
  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      for (const file of files) {
        await uploadFile(file, {
          folder: "products",
          onSuccess: async (key) => {
            // Create Record in DB
            await createImage.mutateAsync({
              productId,
              imageKey: key,
              primary: false,
            });
            refetch();
          },
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageId: string, imageKey: string) => {
    try {
      await removeImage.mutateAsync({ id: imageId });
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
          disabled={isUploading}
        >
          {isUploading ? (
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

        {uploadingFiles.map((uploadState) => (
          <div
            key={uploadState.id}
            className="group relative aspect-square rounded-md overflow-hidden border bg-muted"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              {uploadState.status === "success" ? (
                <svg className="size-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : uploadState.status === "error" ? (
                <svg className="size-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <Loader2 className="size-12 animate-spin text-primary mb-2" />
              )}
              <div className="w-full space-y-1">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${uploadState.status === "success" ? "bg-green-500" :
                      uploadState.status === "error" ? "bg-red-500" :
                        "bg-primary"
                      }`}
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {uploadState.status === "success" ? "Done" :
                    uploadState.status === "error" ? "Failed" :
                      uploadState.status === "processing" ? "Saving..." :
                        `${uploadState.progress}%`}
                </p>
              </div>
            </div>
          </div>
        ))}

        {images?.length === 0 && uploadingFiles.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-md">
            No images uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};
