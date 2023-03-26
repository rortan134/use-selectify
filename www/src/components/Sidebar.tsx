"use client";
import { ChevronDown,Github, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { routes } from "../routes";
import { cn } from "../utils/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./Accordion";
import { Button } from "./Button";

export default function Sidebar() {
  const currentRoute = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <aside
      className={cn(
        "sticky top-14 z-20 col-span-full h-fit max-h-full space-y-8 overflow-x-hidden border-b border-neutral-600 bg-inherit px-2 pb-2 font-inter tracking-tight transition-colors md:col-span-1 md:max-h-screen md:w-64 md:border-none md:pb-6",
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
        className={cn("flex w-full flex-col space-y-6", {
          "hidden md:flex": !isOpen,
        })}
      >
        <div className="flex w-full flex-col space-y-3">
          <h2 className="px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Getting Started
          </h2>
          <Button
            href="https://github.com/rortan134/use-selectify#readme"
            target="_blank"
            variant="ghost"
            className="group justify-between"
          >
            <span className="flex">
              <Github className="mr-2 h-5 w-5" />
              Documentation
            </span>
            <span className="w-min rounded-2xl bg-neutral-200 py-1 px-2 text-xs text-slate-900 group-hover:bg-neutral-300 dark:bg-neutral-800 dark:text-slate-50 dark:group-hover:bg-neutral-700">
              v0.3.2
            </span>
          </Button>
        </div>
        <div className="flex w-full flex-col space-y-6">
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
                      className="group w-full opacity-100"
                    >
                      {pageRoute.name}
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform group-aria-[expanded=true]:rotate-180"
                        )}
                      />
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="ml-6 h-0 overflow-hidden border-l border-neutral-200 pl-3 transition-[height] data-[state=open]:h-[var(--radix-accordion-content-height)] dark:border-neutral-700">
                    <div className="flex w-full flex-col space-y-3">
                      {pageRoute.subRoutes?.map((route) => (
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
