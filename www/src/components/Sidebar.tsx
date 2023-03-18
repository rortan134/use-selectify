"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isMobile } from "react-device-detect";

import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Separator } from "./Separator";
import { cn } from "../utils/cn";

import { ExternalLink, Download, Github, Menu } from "lucide-react";

import { routes } from "../routes";

import Logo from "../../public/logo.svg";
import Banner from "../../public/use-selectify-banner.png";

export default function Sidebar() {
  const currRoute = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <aside
      className={cn(
        "md:max-h-auto relative h-full max-h-screen w-full overflow-x-hidden p-1 transition-colors md:w-72 md:overflow-y-hidden md:px-3 md:py-6 md:hover:overflow-y-auto",
        {
          "h-fit": !isOpen && isMobile,
          "border-r border-[#444444] bg-[#2c2c2c]": currRoute === "/figma",
        }
      )}
    >
      <div className="sticky top-0 h-fit w-full space-y-8">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex items-center rounded-lg p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
              <Image
                src={Logo}
                className="mr-4 aspect-square invert dark:invert-0"
                height={36}
                width={36}
                alt="use-selectify package logo"
              />
              <div className="flex flex-1 flex-col">
                <h1 className="text-left text-lg font-semibold text-slate-900 dark:text-slate-50">
                  use-selectify
                </h1>
                <p className="text-left text-xs text-slate-900 dark:text-slate-50">
                  The ultimate drag-to-select solution for React.
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuLabel>Assets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Button variant="link" className="text-white" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Logo
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="link" className="text-white" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Banner
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen((prevState) => !prevState)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
        {(isOpen && isMobile) || !isMobile ? (
          <nav className="flex w-full flex-col space-y-6">
            <div className="flex w-full flex-col space-y-3">
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
                <span className="w-min rounded-2xl bg-neutral-300 py-1 px-2 text-xs text-slate-800 dark:bg-neutral-800 dark:text-slate-50">
                  v0.3.2
                </span>
              </Button>
              <Separator />
            </div>
            <div className="flex w-full flex-col space-y-3">
              <h2 className="px-4 text-base font-semibold text-slate-900 dark:text-slate-50">
                Examples
              </h2>
              {routes.map((route) => (
                <Button
                  key={route.route}
                  href={route.route}
                  data-state={currRoute === route.route ? "open" : "closed"}
                  variant="ghost"
                  className="group"
                  disabled={route.disabled}
                >
                  {route.icon}
                  {route.name}
                </Button>
              ))}
              <Separator />
            </div>
            <div className="flex w-full flex-col space-y-3">
              <h2 className="px-4 text-base font-semibold text-slate-900 dark:text-slate-50">
                Community
              </h2>
              <Button
                href="https://github.com/rortan134/use-selectify/issues/new"
                target="_blank"
                variant="ghost"
              >
                Twitter
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button
                href="https://github.com/rortan134/use-selectify/issues/new"
                target="_blank"
                variant="ghost"
              >
                Report an issue
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>
        ) : null}
      </div>
    </aside>
  );
}
