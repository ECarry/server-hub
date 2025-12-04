'use client'

import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { FilterCarousel } from "../components/filter-carousel";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const BrandsView = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.home.getManyBrands.queryOptions())

  const onSelect = (value: string | null) => {
    console.log(value)
  }

  return (
    <div className="flex items-center gap-x-2">
      <Button
        size="lg"
        variant="secondary"
        onClick={() => { }}
        className="max-md:hidden rounded-full"
        asChild
      >
        <div className="flex items-center gap-x-2">
          <Settings2 className="size-4" />
          <span>Filters</span>
        </div>
      </Button>
      <FilterCarousel value={null} data={data} onSelect={onSelect} />
    </div>
  )
}

export const BrandsViewLoading = () => {
  return (
    <div className="flex items-center gap-x-2">
      <Button
        size="lg"
        variant="secondary"
        onClick={() => { }}
        className="max-md:hidden rounded-full"
        asChild
      >
        <div className="flex items-center gap-x-2">
          <Settings2 className="size-4" />
          <span>Filters</span>
        </div>
      </Button>
      <FilterCarousel value={null} data={[]} onSelect={() => { }} />
    </div>
  )
}