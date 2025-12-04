"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useBrandsFilters } from "../../hooks/use-brands-filters";
import { DEFAULT_PAGE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BrandsSearchFilter } from "./brands-search-filter";
import { BrandCreateModal } from "./brand-create-modal";

export const BrandsListHeader = () => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useBrandsFilters();

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <BrandCreateModal open={open} onOpenChange={setOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-muted-foreground ">
            Here&apos;s a list of your brands
          </p>
        </div>

        <div className="flex items-center justify-between">
          <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
              <BrandsSearchFilter />
              {isAnyFilterModified && (
                <Button onClick={onClearFilters} variant="outline" size="sm">
                  <XCircle />
                  Clear
                </Button>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Button variant="default" onClick={() => setOpen(true)}>
            Add Brand
          </Button>
        </div>
      </div>
    </>
  );
};
