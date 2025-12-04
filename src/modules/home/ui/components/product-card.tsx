/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Bookmark,
  Download,
  MoreHorizontal,
  Link as LinkIcon,
} from "lucide-react";
import { Product } from "../../types";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";

export function ProductCard({ product }: { product: Product }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [scrollPrev, setScrollPrev] = React.useState<boolean>(false);
  const [scrollNext, setScrollNext] = React.useState<boolean>(true);


  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    api.on("select", () => {
      setScrollPrev(api.canScrollPrev());
      setScrollNext(api.canScrollNext());
    });
  }, [api]);

  return (
    <div className="group relative flex flex-col gap-y-3 md:gap-y-4">
      <div className="relative rounded-[28px] overflow-hidden w-full hidden md:block md:bg-foreground/4 md:group-hover:bg-foreground/6 transition duration-300 md:pt-6 md:pb-7 h-[300px]">
        <Carousel
          setApi={setApi}
          className="m-0"
          opts={{
            align: "end",
            duration: 20,
          }}
        >
          <CarouselContent className="m-0">
            {product.images?.map((image, index) => (
              <CarouselItem
                key={index}
                className="px-7 flex items-center justify-center"
              >
                <img
                  src={keyToUrl(image.imageKey)}
                  alt="Product Image"
                  className="rounded-3xl overflow-hidden object-contain h-[283px] w-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            variant="ghost"
            className={cn(
              "invisible group-hover:visible ml-14 rounded-xl size-10 bg-background z-50",
              scrollPrev ? "" : "hidden"
            )}
          />
          <CarouselNext
            variant="ghost"
            className={cn(
              "invisible group-hover:visible mr-14 rounded-xl size-10 bg-background z-50",
              scrollNext ? "" : "hidden"
            )}
          />
        </Carousel>

        <div className="absolute z-10 bottom-3 left-1/2 transform -translate-x-1/2 invisible group-hover:visible">
          <div className="flex gap-3">
            {product.images?.map((_, index) => (
              <button
                key={index}
                className="relative size-1.5 overflow-hidden rounded-full"
              >
                <div className="w-full h-full bg-muted-foreground/30 dark:bg-muted-foreground/70 absolute"></div>
                <div
                  className={cn(
                    "h-full bg-primary relative w-0 z-10",
                    current === index + 1 ? "w-full" : ""
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM LOGO TITLE  */}
      <div className="flex items-center gap-x-3 w-full">
        <div className="shrink-0 h-10 w-10 rounded-xl overflow-hidden bg-muted p-1">
          <img
            src={keyToUrl(product.brandLogoKey ?? "")}
            alt="logo"
            className="object-contain w-full h-full"
          />
        </div>

        <Link href={`/product/${product.id}`} className="flex grow flex-col">
          <span className="line-clamp-1 text-body-medium-bold underline decoration-transparent group-hover:decoration-current transition-colors ease-out">
            {product.brand} {product.series}
          </span>
          <span className="line-clamp-1 text-sm text-muted-foreground font-normal">
            {product.model}{" "}
            <span className="text-xs text-muted-foreground/80">
              {product.generation}
            </span>
          </span>
        </Link>

        {/* BOTTOM BUTTON  */}
        <div
          className={cn(
            "hidden gap-x-2 group-focus-within:flex group-hover:flex transition ease-out",
            menuOpen ? "flex" : "hidden"
          )}
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="rounded-xl z-50"
                  onClick={() => alert("Saved!!")}
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Tooltip>
              <DropdownMenu
                open={menuOpen}
                onOpenChange={() => setMenuOpen(!menuOpen)}
              >
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-xl z-50"
                    >
                      <MoreHorizontal className="size-5" />
                    </Button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      className="flex justify-start items-center gap-x-2"
                      href="/"
                    >
                      <Download className="size-5" />
                      <span>Download all screens</span>
                      <Badge className="px-2 font-medium uppercase border-none">
                        PRO
                      </Badge>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      className="flex justify-start items-center gap-x-2"
                      href="/"
                    >
                      <LinkIcon className="size-5" />
                      <span>Copy link app</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
