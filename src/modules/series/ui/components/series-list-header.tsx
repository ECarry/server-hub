"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useSeriesFilters } from "../../hooks/use-series-filters";
import { DEFAULT_PAGE } from "@/constants";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SeriesSearchFilter } from "./series-search-filter";
import { SeriesModal } from "./series-modal";

export const SeriesListHeader = () => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useSeriesFilters();

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <SeriesModal open={open} onOpenChange={setOpen} />
      <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
        <div>
          <h1 className="text-2xl font-bold">Series</h1>
          <p className="text-muted-foreground ">
            Here&apos;s a list of your series
          </p>
        </div>

        <div className="flex items-center justify-between">
          <ScrollArea>
            <div className="flex items-center gap-x-2 p-1">
              <SeriesSearchFilter />
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
            Add Series
          </Button>
        </div>
      </div>
    </>
  );
};
