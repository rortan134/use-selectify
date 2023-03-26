"use client";
import { usePathname } from "next/navigation";
import * as React from "react";
import tinycolor from "tinycolor2";

import { routes } from "../routes";
import { cn } from "../utils/cn";

export default function Body({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const themeColor =
    routes.find((route) => pathname.includes(route?.route ?? ""))?.themeColor ||
    routes
      .map((route) =>
        route.subRoutes?.find((subRoute) => subRoute.route === pathname)
      )
      .find((route) => route?.themeColor)?.themeColor ||
    "#131313";
  const isDark = tinycolor(themeColor).isDark();

  return (
    <body
      className={cn(
        "relative grid min-h-screen w-full auto-rows-min grid-cols-5 transition-colors",
        {
          dark: isDark,
        }
      )}
      style={{ backgroundColor: themeColor }}
    >
      {children}
    </body>
  );
}
