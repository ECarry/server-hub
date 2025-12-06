"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brand } from "../../types";

interface FilterCarouselProps {
  value?: string | null;
  isLoading?: boolean;
  onSelect: (value: string | null) => void;
  data: Brand[];
}

export const FilterCarousel = ({
  value,
  isLoading,
  onSelect,
  data,
}: FilterCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative w-full">
      {/* Left fade  */}
      <div
        className={cn(
          "absolute left-8 sm:left-12 top-0 bottom-0 w-8 sm:w-12 z-10 bg-linear-to-r from-white to-transparent dark:from-background pointer-events-none",
          current === 1 && "hidden"
        )}
      />

      {/* Right fade */}
      <div
        className={cn(
          "absolute right-8 sm:right-12 top-0 bottom-0 w-8 sm:w-12 z-10 bg-linear-to-l from-white dark:from-background to-transparent pointer-events-none",
          current === count && "hidden"
        )}
      />

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full px-8 sm:px-12"
      >
        <CarouselContent className="-ml-3">
          {!isLoading && (
            <CarouselItem
              onClick={() => onSelect(null)}
              className="basis-auto pl-3"
            >
              <Badge
                variant={!value ? "default" : "secondary"}
                className="px-4 cursor-pointer whitespace-normal text-sm h-9 md:h-11 rounded-full"
              >
                All
              </Badge>
            </CarouselItem>
          )}

          {isLoading &&
            Array.from({ length: 10 }).map((_, index) => (
              <CarouselItem key={index} className="basis-auto pl-3">
                <Skeleton className="px-4 cursor-pointer whitespace-normal text-sm h-9 md:h-11 rounded-full w-[100px]">
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))}

          {!isLoading &&
            data.map((item) => (
              <CarouselItem
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="basis-auto pl-3"
              >
                <Badge
                  variant={value === item.id ? "default" : "secondary"}
                  className="px-4 cursor-pointer whitespace-normal text-sm h-9 md:h-11 rounded-full font-semibold"
                >
                  {item.name}
                </Badge>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20 h-8 w-8 sm:h-9 sm:w-9" />
        <CarouselNext className="right-0 z-20 h-8 w-8 sm:h-9 sm:w-9" />
      </Carousel>
    </div>
  );
};
