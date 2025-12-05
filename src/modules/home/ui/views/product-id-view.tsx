"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, HardDrive } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ProductIdViewProps {
  productId: string;
}

export const ProductIdView = ({ productId }: ProductIdViewProps) => {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.home.getProductById.queryOptions(productId)
  );

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <p className="text-xl font-semibold">Product not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Top Section: Images & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Image Carousel */}
        <div className="rounded-3xl overflow-hidden bg-muted/30 p-4 md:p-8 flex items-center justify-center">
          <Carousel className="w-full max-w-md">
            <CarouselContent>
              {((product.images?.length ? product.images : [{ imageKey: null } as const])).map(
                (image, index) => (
                  <CarouselItem key={index} className="flex justify-center">
                    <div className="relative w-full aspect-square">
                      {image.imageKey ? (
                        <Image
                          src={keyToUrl(image.imageKey) ?? ""}
                          alt={product.model}
                          fill
                          className="object-contain"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted rounded-xl">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
            {product.images && product.images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        </div>

        {/* Right: Basic Info */}
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 relative rounded-lg overflow-hidden border">
                <Image
                  src={keyToUrl(product.brandLogoKey) ?? ""}
                  alt={product.brand || "Brand"}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{product.model}</h1>
                <div className="text-muted-foreground flex items-center gap-2">
                  {product.brand} {product.series}
                  {product.generation && <Badge variant="outline">{product.generation}</Badge>}
                </div>
              </div>
            </div>

            <div className="text-lg">
              <span className="font-semibold">Category: </span> {product.category}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Release: {product.releaseDate ? format(new Date(product.releaseDate), "PP") : "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span>EOL: {product.eolDate ? format(new Date(product.eolDate), "PP") : "Active"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {!!product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {Object.entries(product.specifications as Record<string, string | number>).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                  <dd className="text-base font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Bottom Section: Documentation & Downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.documents && product.documents.length > 0 ? (
              <ul className="space-y-3">
                {product.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-8 w-8 text-primary/80 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.fileType} • {doc.fileSize} • {doc.version ? `v${doc.version}` : ""}</p>
                      </div>
                    </div>
                    {/* Add download/view button based on fileKey/visibility? Assuming fileKey implies download */}
                    <Button variant="ghost" size="icon" asChild>
                      <a href={keyToUrl(doc.fileKey)} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No documentation available.</p>
            )}
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.downloads && product.downloads.length > 0 ? (
              <ul className="space-y-3">
                {product.downloads.map((dl) => (
                  <li key={dl.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Download className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{dl.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dl.operatingSystem ? `${dl.operatingSystem}` : "All OS"} • {dl.fileType} • {dl.fileSize}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={keyToUrl(dl.fileKey)} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No downloads available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const ProductIdViewLoading = () => {
  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="rounded-3xl bg-muted/30 p-4 md:p-8 aspect-square animate-pulse" />
        <div className="flex flex-col gap-6">
          <div className="h-12 w-3/4 bg-muted animate-pulse rounded-lg" />
          <div className="h-6 w-1/2 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  )
}
