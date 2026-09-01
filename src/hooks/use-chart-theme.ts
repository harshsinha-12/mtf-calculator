"use client";

import { useTheme } from "@/components/theme-provider";

export function useChartTheme() {
  const { theme } = useTheme();

  return theme === "dark"
    ? {
        grid: "#27272a",
        axis: "#71717a",
        reference: "#52525b",
        stroke: "#a1a1aa",
        tooltipBorder: "border-border",
        tooltipBg: "bg-surface",
        tooltipText: "text-muted",
      }
    : {
        grid: "#e4e4e7",
        axis: "#a1a1aa",
        reference: "#d4d4d8",
        stroke: "#71717a",
        tooltipBorder: "border-border",
        tooltipBg: "bg-surface",
        tooltipText: "text-muted",
      };
}
