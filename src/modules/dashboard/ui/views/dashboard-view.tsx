import data from "@/modules/dashboard/lib/data.json";
import { CardsSection } from "../sections/cards-section";
import { ChartAreaInteractiveSection } from "@/modules/dashboard/ui/sections/chart-area-interactive-section";
import { TableSection } from "@/modules/dashboard/ui/sections/table-section";

export const DashboardView = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <CardsSection />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractiveSection />
          </div>
          <TableSection data={data} />
        </div>
      </div>
    </div>
  );
};
