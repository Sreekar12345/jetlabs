/**
 * Dashboard state store — filters, active views, selected items.
 *
 * This is for UI-local state that doesn't belong in server state
 * (e.g., which batch filter is active, which tab is selected).
 */
import { create } from "zustand";

type DashboardState = {
  selectedBatch: string | null;
  selectedDepartment: string | null;
  activeTab: string;
  // Actions
  setSelectedBatch: (batch: string | null) => void;
  setSelectedDepartment: (dept: string | null) => void;
  setActiveTab: (tab: string) => void;
  resetFilters: () => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedBatch: null,
  selectedDepartment: null,
  activeTab: "overview",

  setSelectedBatch: (batch) => set({ selectedBatch: batch }),
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  resetFilters: () =>
    set({
      selectedBatch: null,
      selectedDepartment: null,
      activeTab: "overview",
    }),
}));
