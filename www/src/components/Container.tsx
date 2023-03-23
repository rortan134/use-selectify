import * as React from "react";

import { cn } from "../utils/cn";

export const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <section
      {...props}
      ref={forwardedRef}
      className={cn("h-full w-full container relative mx-auto py-16 px-4 md:px-8", className)}
    >
      {children}
    </section>
  );
});
Container.displayName = "Container";
