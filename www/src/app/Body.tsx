"use client";
import * as React from "react";

import { usePathname } from "next/navigation";
import { cn } from "../utils/cn";
import tinycolor from "tinycolor2";

import { routes } from "../routes";

export default function Body({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const bodyColor = routes.find(
    (route) => route.route === pathname
  )?.themeColor;
  const isDark = tinycolor(bodyColor).isDark();

  return (
    <body
      className={cn(
        "flex w-full flex-col flex-nowrap justify-between transition-colors md:flex-row",
        {
          dark: isDark,
        }
      )}
      style={{ backgroundColor: bodyColor }}
    >
      {children}
    </body>
  );
}
