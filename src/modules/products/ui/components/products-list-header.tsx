"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useProductsFilters } from "../../hooks/use-products-filters";
import { DEFAULT_PAGE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ProductsSearchFilter } from "./products-search-filter";
import { ProductCreateModal } from "./product-create-modal";

export const ProductsListHeader = () => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useProductsFilters();

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <ProductCreateModal open={open} onOpenChange={setOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground ">
            Here&apos;s a list of your products
          </p>
        </div>

        <div className="flex items-center justify-between">
          <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
              <ProductsSearchFilter />
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
            Add Product
          </Button>
        </div>
      </div>
    </>
  );
};
