import {
  Calendar,
  Code2,
  ExternalLink,
  Figma,
  Folders,
  Table,
  Table2,
} from "lucide-react";
import type { Route } from "next";
import React from "react";

export interface AppRoute {
  name: string;
  description?: string;
  icon: JSX.Element;
  route?: Route;
  themeColor?: string;
  subRoutes?: AppRoute[];
  code?: string;
  disabled?: boolean;
  newTab?: boolean;
}

export const routes: AppRoute[] = [
  {
    name: "Examples",
    description:
      "Showcase of a few available configurations for building complex interactions with use-selectify.",
    icon: <Code2 className="mr-2 h-4 w-4" />,
    route: "/docs/examples",
    subRoutes: [
      {
        name: "Table",
        icon: <Table className="mr-2 h-4 w-4" />,
        route: "/docs/examples/table",
        code: "https://github.com/rortan134/use-selectify/blob/master/www/src/app/docs/examples/table/page.tsx",
      },
      {
        name: "File Explorer",
        icon: <Folders className="mr-2 h-4 w-4" />,
        route: "/docs/examples/explorer",
        code: "https://github.com/rortan134/use-selectify/blob/master/www/src/app/docs/examples/explorer/page.tsx",
      },
      {
        name: "Spreadsheet (soon)",
        icon: <Table2 className="mr-2 h-4 w-4" />,
        route: "/docs/examples/spreadsheet",
        code: "https://github.com/rortan134/use-selectify/blob/master/www/src/app/docs/examples/spreadsheet/page.tsx",
        disabled: true,
      },
      {
        name: "Calendar",
        icon: <Calendar className="mr-2 h-4 w-4" />,
        route: "/docs/examples/calendar",
        code: "https://github.com/rortan134/use-selectify/blob/master/www/src/app/docs/examples/calendar/page.tsx",
      },
      {
        name: "Notion Demo",
        icon: <NotionIcon />,
        route: "/docs/examples/notion",
        themeColor: "#ffffff",
        code: "https://github.com/rortan134/use-selectify/blob/master/www/src/app/docs/examples/notion/page.tsx",
      },
      {
        name: "Figma Demo",
        icon: <Figma className="mr-2 h-4 w-4" />,
        route: "/docs/examples/figma",
        themeColor: "#1e1e1e",
        code: "https://github.com/rortan134/use-selectify/blob/master/www/src/app/docs/examples/figma/page.tsx",
      },
    ],
  },
  {
    name: "Community",
    icon: <Figma className="mr-2 h-4 w-4" />,
    subRoutes: [
      {
        name: "Twitter",
        icon: <ExternalLink className="mr-2 h-4 w-4" />,
        route: "https://twitter.com/meetgilberto",
        newTab: true,
      },
      {
        name: "View on npm",
        icon: <ExternalLink className="mr-2 h-4 w-4" />,
        route: "https://www.npmjs.com/package/use-selectify",
        newTab: true,
      },
      {
        name: "Report an issue",
        icon: <ExternalLink className="mr-2 h-4 w-4" />,
        route: "https://github.com/rortan134/use-selectify/issues/new",
        newTab: true,
      },
    ],
  },
];

function NotionIcon() {
  return (
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
  );
}
