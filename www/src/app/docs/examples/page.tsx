"use client";
import * as React from "react";
import { usePathname } from "next/navigation";

import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";

import { routes } from "../../../routes";

export default function ExamplesPage() {
  const currentRoute = usePathname();
  const exampleRoute = routes.find((route) => route.route === currentRoute);

  return (
    <Container>
      <div className="mb-14 space-y-4 md:px-16">
        {exampleRoute ? (
          <>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-50">
                {exampleRoute.name}
              </h1>
              <p className="text-lg text-slate-900 dark:text-neutral-400">
                {exampleRoute.description}
              </p>
            </div>
            <div className="grid gap-y-4 gap-x-5 md:grid-cols-2">
              {exampleRoute.subRoutes?.map((subRoute) => (
                <Button
                  key={subRoute.name}
                  href={subRoute.route}
                  variant="outline"
                  size="lg"
                  className="group col-span-1"
                  disabled={subRoute.disabled}
                >
                  {subRoute.icon}
                  {subRoute.name}
                </Button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Container>
  );
}
