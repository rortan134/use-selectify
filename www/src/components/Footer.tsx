"use client";
import { ChevronLeft,ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { type AppRoute,routes } from "../routes";
import { Button } from "./Button";
import { Container } from "./Container";

export default function Footer() {
  const currentPathname = usePathname();
  const { previousRoute, nextRoute } = getPreviousAndNextRoutes(
    currentPathname,
    routes
  );

  return (
    <footer className="col-span-full w-full border-t border-neutral-600/50 bg-inherit text-slate-900 dark:text-slate-50">
      <Container className="py-6">
        <div className="flex items-center justify-between">
          {previousRoute ? (
            <Button
              href={previousRoute.route}
              size="lg"
              variant="ghost"
              className="h-fit flex-col items-end"
            >
              <div className="flex items-center">
                <ChevronLeft className="ml-2 h-5 w-5 opacity-75" />
                <span className="opacity-75">Previous</span>
              </div>
              <span className="text-lg">{previousRoute.name}</span>
            </Button>
          ) : (
            <div />
          )}
          {nextRoute ? (
            <Button
              href={nextRoute.route}
              size="lg"
              variant="ghost"
              className="h-fit flex-col items-start"
            >
              <div className="flex items-center">
                <span className="opacity-75">Next</span>
                <ChevronRight className="mr-2 h-5 w-5 opacity-75" />
              </div>
              <span className="text-lg">{nextRoute.name}</span>
            </Button>
          ) : null}
        </div>
        <div className="flex justif-center">
            <span className="mt-4 opacity-60">
              &copy; 2023 use-selectify | MIT License
            </span>
        </div>
      </Container>
    </footer>
  );
}

function flattenRoutes(routes: AppRoute[]): AppRoute[] {
  const flattenedRoutes: AppRoute[] = [];

  routes.forEach((route) => {
    flattenedRoutes.push(route);

    if (route.subRoutes) {
      flattenedRoutes.push(...flattenRoutes(route.subRoutes));
    }
  });
  return flattenedRoutes;
}

function getPreviousAndNextRoutes(currentRoute: string, routes: AppRoute[]) {
  const flattenedRoutes = flattenRoutes(routes);
  const currentRouteIndex = flattenedRoutes.findIndex(
    (route) => route.route === currentRoute
  );
  let previousRouteIndex = currentRouteIndex - 1;
  while (previousRouteIndex >= 0) {
    if (!flattenedRoutes[previousRouteIndex]?.disabled) {
      return {
        previousRoute: flattenedRoutes[previousRouteIndex],
        nextRoute:
          currentRouteIndex < flattenedRoutes.length - 1
            ? flattenedRoutes[currentRouteIndex + 1]
            : undefined,
      };
    }
    previousRouteIndex--;
  }
  let nextRouteIndex = currentRouteIndex + 1;
  while (nextRouteIndex < flattenedRoutes.length) {
    if (!flattenedRoutes[nextRouteIndex]?.disabled) {
      return {
        previousRoute:
          currentRouteIndex > 0
            ? flattenedRoutes[currentRouteIndex - 1]
            : undefined,
        nextRoute: flattenedRoutes[nextRouteIndex],
      };
    }
    nextRouteIndex++;
  }
  return {};
}
