"use client";
import * as React from "react";
import { usePathname } from "next/navigation";

import { isMobile } from "react-device-detect";

import { Button } from "./Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/Accordion";

import { cn } from "../utils/cn";

import { routes } from "../routes";

import { Github, Menu, X, ChevronDown } from "lucide-react";

export default function Sidebar() {
  const currentRoute = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <aside
      className={cn(
        "sticky top-14 z-20 col-span-full h-fit space-y-8 overflow-x-hidden border-b border-neutral-600 bg-inherit px-2 pb-4 font-inter tracking-tight transition-colors scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-100 dark:scrollbar-thumb-neutral-200/10 md:col-span-1 md:max-h-screen md:w-64 md:border-none",
        {
          "bg-[#2c2c2c]": currentRoute === "/figma",
        }
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="my-2 w-full px-4 md:hidden"
        onClick={() => setIsOpen((prevState) => !prevState)}
      >
        {isOpen ? (
          <X className="mr-2 h-5 w-5" />
        ) : (
          <Menu className="mr-2 h-5 w-5" />
        )}
        Menu
      </Button>
      <div
        className={cn("flex w-full flex-col space-y-4", {
          hidden: !isOpen && isMobile,
        })}
      >
        <h2 className="px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Getting Started
        </h2>
        <div className="flex w-full flex-col space-y-1">
          <Button
            href="https://github.com/rortan134/use-selectify#readme"
            target="_blank"
            variant="ghost"
            className="justify-between"
          >
            <span className="flex">
              <Github className="mr-2 h-5 w-5" />
              Documentation
            </span>
            <span className="w-min rounded-2xl bg-neutral-200 py-1 px-2 text-xs text-slate-800 dark:bg-neutral-800 dark:text-slate-50">
              v0.3.2
            </span>
          </Button>
        </div>
        <div className="flex w-full flex-col space-y-3">
          {routes.map((pageRoute) =>
            pageRoute.subRoutes ? (
              <Accordion
                key={pageRoute.name}
                type="single"
                defaultValue={pageRoute.name}
                collapsible
              >
                <AccordionItem
                  key={pageRoute.name}
                  value={pageRoute.name}
                  className="space-y-3"
                >
                  <AccordionTrigger asChild>
                    <Button
                      href={pageRoute.route}
                      data-state={
                        currentRoute === pageRoute.route ? "open" : "closed"
                      }
                      variant="ghost"
                      className="w-full opacity-100"
                    >
                      {pageRoute.name}
                      <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="ml-6 border-l border-neutral-700 pl-3">
                    <div className="flex w-full flex-col space-y-3">
                      {pageRoute.subRoutes.map((route) => (
                        <Button
                          key={route.name}
                          href={route.route}
                          data-state={
                            currentRoute.includes(route.route as string)
                              ? "open"
                              : "closed"
                          }
                          variant="ghost"
                          className="group"
                          target={route.newTab ? "_blank" : "_self"}
                          disabled={route.disabled}
                        >
                          {route.icon}
                          {route.name}
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Button
                key={pageRoute.name}
                href={pageRoute.route}
                data-state={
                  currentRoute.includes(pageRoute.route ?? "")
                    ? "open"
                    : "closed"
                }
                variant="ghost"
                className="group"
                target={pageRoute.newTab ? "_blank" : "_self"}
                disabled={pageRoute.disabled}
              >
                {pageRoute.icon}
                {pageRoute.name}
              </Button>
            )
          )}
        </div>
      </div>
    </aside>
  );
}
