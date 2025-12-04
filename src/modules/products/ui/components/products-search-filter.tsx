import { Input } from "@/components/ui/input";
import { useProductsFilters } from "../../hooks/use-products-filters";
import { SearchIcon } from "lucide-react";

export const ProductsSearchFilter = () => {
  const [filters, setFilters] = useProductsFilters();

  return (
    <div className="relative">
      <Input
        placeholder="Filter by model"
        value={filters.search}
        className="h-9 w-[200px] pl-7"
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2" />
    </div>
  );
};
