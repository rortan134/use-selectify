"use client";
import * as React from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { cn } from "../utils/cn";

import { ExternalLink, Github, Twitter } from "lucide-react";
import Logo from "../../public/logo.svg";

const NavLink = ({
  href,
  children,
}: {
  href: Route;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "inline-flex h-min items-center p-1 text-center text-sm text-slate-50/80 transition-colors hover:text-slate-50",
          {
            "text-slate-50": isActive,
          }
        )}
        aria-current={isActive}
      >
        {children}
      </Link>
    </li>
  );
};

export default function Header() {
  return (
    <header className="sticky top-0 z-40 col-span-full h-fit w-full border-neutral-600/50 bg-inherit py-5 px-6 font-inter md:border-b md:py-3">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex max-w-md items-center">
          <Image
            src={Logo as StaticImageData}
            className="mr-2 aspect-square invert dark:invert-0"
            height={26}
            width={26}
            alt="use-selectify logo"
          />
          <h1 className="text-left text-xl font-semibold leading-none text-slate-900 dark:text-slate-50">
            use-selectify
          </h1>
        </Link>
        <ul className="hidden flex-1 items-center justify-end space-x-4 md:flex">
          <NavLink href="https://github.com/rortan134/use-selectify#readme">
            Documentation
            <ExternalLink className="ml-2 h-4 w-4" />
          </NavLink>
          <NavLink href="/docs/examples">Examples</NavLink>
          {/* <NavLink href="/about">About</NavLink> */}
          <NavLink href="https://github.com/rortan134/use-selectify">
            <Github className="h-5 w-5" />
          </NavLink>
          <NavLink href="https://twitter.com/meetgilberto">
            <Twitter className="h-5 w-5 fill-slate-50" />
          </NavLink>
        </ul>
      </nav>
    </header>
  );
}
