"use client";
import * as React from "react";

import { usePathname } from "next/navigation";
import { cn } from "../utils/cn";
import tinycolor from "tinycolor2";

import { routes } from "../routes";

export default function Body({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const bodyColor =
    routes.find((route) => route.route === pathname)?.themeColor || "#131313";
  const isDark = tinycolor(bodyColor).isDark();

  return (
    <body
      className={cn(
        "relative grid min-h-screen w-full grid-cols-5 auto-rows-min transition-colors",
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
