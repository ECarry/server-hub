"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchButtonNav() {
  return (
    <Button
      size="lg"
      variant="secondary"
      onClick={() => {}}
      className="h-10 md:h-12 w-full rounded-full justify-between cursor-pointer group relative"
      asChild
    >
      <div>
        <div className="flex items-center gap-x-2">
          <Search className=" size-4 md:size-5" />
          <span className="text-sm sm:text-base text-muted-foreground/80">
            Search...
          </span>
        </div>
        <span className="absolute right-0 top-0 hidden sm:flex gap-x-1 h-full items-center justify-end pr-5 pointer-events-none invisible group-hover:visible group-focus:visible">
          <kbd className="pointer-events-none inline-flex justify-center items-center text-center size-5 select-none gap-1 rounded border bg-background text-xs font-medium text-muted-foreground">
            ⌘
          </kbd>
          <kbd className="pointer-events-none inline-flex justify-center items-center text-center size-5 select-none gap-1 rounded border bg-background text-xs font-medium text-muted-foreground">
            K
          </kbd>
        </span>
      </div>
    </Button>
  );
}
