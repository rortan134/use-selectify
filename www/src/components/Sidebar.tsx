import Image from "next/image";
import { headers } from "next/headers";
import getConfig from "next/config";

import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";
import { Separator } from "./Separator";

import {
  Figma,
  Component,
  ExternalLink,
  Download,
  Cpu,
  HelpCircle,
} from "lucide-react";

import { cn } from "../utils/cn";
import { routes } from "../routes";

import Logo from "../../public/logo.svg";

const runtimeConfig = getConfig();
const useSelectifyVersion = runtimeConfig?.publicRuntimeConfig?.version;

const DemoSelectionButton = ({
  children,
  path,
  hoverText,
  hoverDescription,
  hoverUrl,
}: {
  children: React.ReactNode;
  path: string;
  hoverText: string;
  hoverDescription: string;
  hoverUrl: string;
}) => {
  const pageURL = headers().get("x-pathname") || "";

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          href={path}
          data-state={pageURL === path ? "open" : "closed"}
          variant="ghost"
          className="group"
        >
          {children}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="right">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-black">{hoverText}</h4>
          <p className="text-sm text-black opacity-90">{hoverDescription}</p>
          <Button
            href={hoverUrl}
            target="_blank"
            variant="link"
            size="sm"
            className="px-0 text-blue-500 hover:text-blue-400"
          >
            Visit on GitHub
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default function Sidebar() {
  const pageURL = headers().get("x-pathname") || "";

  return (
    <aside className="fixed left-0 z-50 h-screen w-[270px] space-y-6 overflow-y-hidden bg-gray-900 px-3 py-8 shadow-lg hover:overflow-y-auto">
      <div className="flex flex-col items-center justify-center space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center rounded-lg p-3 transition-colors hover:bg-white/10">
            <Image
              src={Logo}
              className="mr-4 aspect-square"
              height={36}
              width={36}
              alt="use-selectify package logo"
            />
            <h1 className="text-lg font-medium text-white">
              use-selectify{" "}
              <span className="opacity-80">{useSelectifyVersion}</span>
            </h1>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Assets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Button variant="link" className="text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Logo
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button variant="link" className="text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Banner
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-row justify-between px-3">
              <DropdownMenuItem>
                <Button
                  href="https://github.com/rortan134/use-selectify"
                  target="_blank"
                  variant="link"
                  size="sm"
                  className="text-white"
                >
                  GitHub
                </Button>
                <ExternalLink className="h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  href="https://npmjs.com/package/use-selectify"
                  target="_blank"
                  variant="link"
                  size="sm"
                  className="text-white"
                >
                  NPM
                </Button>
                <ExternalLink className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-center text-white">
          The ultimate drag-to-select solution for{" "}
          <a
            href="https://beta.reactjs.org"
            target="_blank"
            className="inline text-blue-500"
          >
            React
          </a>
          .
        </p>
      </div>
      <Separator />
      <nav className="flex w-full flex-col justify-between">
        <section className="flex flex-col space-y-4">
          <h2 className="px-4 text-sm font-semibold text-white">
            Getting Started
          </h2>
          <Button
            href="/introduction"
            variant="ghost"
            data-state={pageURL === "/introduction" ? "open" : "closed"}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Introduction
          </Button>
          <Button
            href="/faq"
            variant="ghost"
            data-state={pageURL === "/faq" ? "open" : "closed"}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </Button>
          <Separator />
          <h2 className="px-4 text-sm font-semibold text-white">Examples</h2>
          <DemoSelectionButton
            hoverText="Notion Demo"
            hoverDescription=""
            path="/notion"
            hoverUrl="/"
          >
            <svg
              className="mr-2 h-4 w-4 invert transition-[filter] group-data-[state=open]:invert-0"
              width="8"
              height="8"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
                fill="#fff"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
                fill="#000"
              />
            </svg>
            Notion
          </DemoSelectionButton>
          <DemoSelectionButton
            hoverText="Figma Demo"
            hoverDescription=""
            path="/figma"
            hoverUrl="/"
          >
            <Figma className="mr-2 h-4 w-4" />
            Figma
          </DemoSelectionButton>
          <DemoSelectionButton
            hoverText="Selection Performance Test"
            hoverDescription=""
            path="/performance"
            hoverUrl="/"
          >
            <Cpu className="mr-2 h-4 w-4" />
            Performance Test
          </DemoSelectionButton>
          <DemoSelectionButton
            hoverText="Storybook Options"
            hoverDescription=""
            path="/storybook"
            hoverUrl="/"
          >
            <Component className="mr-2 h-4 w-4" />
            Storybook
          </DemoSelectionButton>
        </section>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center">
          <a
            href="https://github.com/rortan134/use-selectify/issues"
            target="_blank"
            className="flex items-center py-4 text-blue-500 underline-offset-2 hover:underline"
          >
            Report issue
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </nav>
    </aside>
  );
}
