import { headers } from "next/headers";
import localFont from "next/font/local";

import { cva, VariantProps } from "class-variance-authority";
import "~/styles/globals.css";

import Sidebar from "../components/Sidebar";
import FloatingButton from "../components/FloatingButton";

import { routes } from "../routes";

export const metadata = {
  title: "use-selectify Demo - The Ultimate Drag-to-Select Solution for React",
  description: "Welcome to Next.js",
};

const SegoeUI = localFont({
  src: "../../public/SegoeUI.woff",
  variable: "--font-segoe",
});

const bodyVariants = cva(
  "relative min-h-screen w-full transition-colors flex justify-between flex-nowrap",
  {
    variants: {
      background: {
        default: "bg-gray-200",
        notion: "bg-white",
        figma: "bg-[#1e1e1e]",
      },
    },
    defaultVariants: {
      background: "default",
    },
  }
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageURL = headers().get("x-pathname") || "";
  const routeSettings = routes.find((route) => route.route === pageURL);
  const bodyClassName = bodyVariants({
    background: routeSettings?.themeColor as VariantProps<
      typeof bodyVariants
    >["background"],
  });

  return (
    <html lang="en" dir="ltr" className={SegoeUI.variable}>
      <body className={bodyClassName}>
        <Sidebar />
        <main className="relative h-full min-h-screen w-full">{children}</main>
        <FloatingButton />
      </body>
    </html>
  );
}
