"use client";

import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { FilterCarousel } from "../components/filter-carousel";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useHomeFilters } from "../../hooks/use-home-filters";

export const BrandsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.home.getManyBrands.queryOptions());
  const [filters, setFilters] = useHomeFilters();

  const onSelect = (value: string | null) => {
    setFilters({ brandId: value || "" });
  };

  return (
    <div className="flex items-center gap-x-3 overflow-hidden">
      <Button
        size="lg"
        variant="secondary"
        onClick={() => {}}
        className="max-md:hidden rounded-xl h-11 px-5 font-semibold shrink-0"
        asChild
      >
        <div className="flex items-center gap-x-2">
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
        </div>
      </Button>
      <div className="flex-1 min-w-0">
        <FilterCarousel
          value={filters.brandId || null}
          data={data}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
};

export const BrandsViewLoading = () => {
  return (
    <div className="flex items-center gap-x-3 overflow-hidden">
      <Button
        size="lg"
        variant="secondary"
        onClick={() => {}}
        className="max-md:hidden rounded-xl h-11 px-5 font-semibold shrink-0"
        asChild
      >
        <div className="flex items-center gap-x-2">
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
        </div>
      </Button>
      <div className="flex-1 min-w-0">
        <FilterCarousel value={null} data={[]} onSelect={() => {}} isLoading />
      </div>
    </div>
  );
};
