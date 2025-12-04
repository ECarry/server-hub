"use client";

import { useQueryStates } from "nuqs";
import { filtersSearchParams } from "../params";

export const useHomeFilters = () => {
  return useQueryStates(filtersSearchParams, {
    shallow: false,
  });
};
