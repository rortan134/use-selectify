"use client";
import { usePathname } from "next/navigation";

import { Button } from "./Button";
import { ExternalLink } from "lucide-react";
import { routes } from "../routes";

export default function FloatingButton() {
  const path = usePathname();
  const demoCode = routes.find((route) => route.route === path);

  return demoCode ? (
    <Button
      href={demoCode.code}
      className="hidden md:inline-flex z-50 fixed top-0 right-0 m-1 hover:text-blue-500"
      variant="link"
    >
      View Code <ExternalLink className="ml-2 h-4 w-4" />
    </Button>
  ) : null;
}
