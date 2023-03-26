"use client";
import * as React from "react";
import { isMobile } from "react-device-detect";
import { useSelectify } from "use-selectify";

export default function LandingSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectionContainerRef = React.useRef(null);
  const { SelectBoxOutlet } = useSelectify(selectionContainerRef, {
    selectCriteria: "[data-selectable]",
    exclusionZone: "[data-exclude]",
    onSelect: (element) => {
      element.setAttribute("data-selected", "true");
    },
    onUnselect: (element) => {
      element.removeAttribute("data-selected");
    },
    disabled: isMobile
  });

  return (
    <div
      ref={selectionContainerRef}
      className="relative h-full w-full md:select-none"
    >
      {children}
      <SelectBoxOutlet className="border border-dashed border-neutral-50/40 bg-slate-50/10 rounded" />
    </div>
  );
}
