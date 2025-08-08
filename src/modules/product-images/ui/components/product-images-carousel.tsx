/* eslint-disable @next/next/no-img-element */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ProductImagesGetManyOutput } from "../../types";
import { getFileUrl } from "@/modules/file-uploader/lib/utils";
import { X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface ProductImagesCarouselProps {
  images: ProductImagesGetManyOutput;
}

export function ProductImagesCarousel({ images }: ProductImagesCarouselProps) {
  const utils = trpc.useUtils();
  const removeData = trpc.productImages.remove.useMutation({
    onSuccess: () => {
      utils.productImages.getMany.invalidate();
      toast.success("Image removed successfully");
    },
  });
  const removeFile = trpc.filesUpload.deleteFile.useMutation();

  const handleRemove = async (id: string, fileKey: string) => {
    await removeData.mutate({ id });
    await removeFile.mutate({ fileKey });
  };

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem
            key={index}
            className="basis-1/2 2xl:basis-1/3 relative group"
          >
            <Card className="h-50 flex items-center justify-center shadow-none bg-muted">
              <CardContent className="p-0">
                <img
                  src={getFileUrl(image.imageKey)}
                  alt={image.imageKey}
                  className="object-contain rounded-lg"
                />
              </CardContent>
            </Card>
            <button
              type="button"
              className="absolute top-2 right-2 cursor-pointer group-hover:block hidden"
              onClick={() => handleRemove(image.id, image.imageKey)}
            >
              <X className="size-5" />
            </button>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
