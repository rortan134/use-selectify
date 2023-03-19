import localFont from "next/font/local";
import { Inter } from "next/font/google"

import "~/styles/globals.css";

import Sidebar from "../components/Sidebar";
import FloatingButton from "../components/FloatingButton";
import Body from "./Body";

export const metadata = {
  title: "use-selectify Demo - The Ultimate Drag-to-Select Solution for React",
  description: "Welcome to Next.js",
};

const segoeUI = localFont({
  src: "../../public/SegoeUI.woff",
  variable: "--font-segoe",
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap'
  });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${segoeUI.variable} ${inter.variable}`}>
      <Body>
        <Sidebar />
        <main className="relative w-full px-3">{children}</main>
        <FloatingButton />
      </Body>
    </html>
  );
}
