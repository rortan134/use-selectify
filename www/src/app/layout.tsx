import localFont from "next/font/local";

import "~/styles/globals.css";

import Sidebar from "../components/Sidebar";
import FloatingButton from "../components/FloatingButton";
import Body from "./Body";

export const metadata = {
  title: "use-selectify Demo - The Ultimate Drag-to-Select Solution for React",
  description: "Welcome to Next.js",
};

const SegoeUI = localFont({
  src: "../../public/SegoeUI.woff",
  variable: "--font-segoe",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={SegoeUI.variable}>
      <Body>
        <Sidebar />
        <main className="relative h-full w-full">{children}</main>
        <FloatingButton />
      </Body>
    </html>
  );
}
