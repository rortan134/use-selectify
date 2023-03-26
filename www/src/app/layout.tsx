import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";

import "~/styles/globals.css";

import Body from "./Body";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "The Ultimate Drag-to-Select Solution for React | use-selectify",
  description: "The Ultimate Drag-to-Select Solution for React",
  generator: "use-selectify",
  applicationName: "use-selectify",
  keywords: ["Drag", "Interactivity", "React", "JavaScript"],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/logo.png",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
      },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "120x120",
    },
  },
  themeColor: "#131313",
  openGraph: {
    title: "The Ultimate Drag-to-Select Solution for React | use-selectify",
    description: "The Ultimate Drag-to-Select Solution for React",
    url: "https://useselectify.js.org",
    siteName: "use-selectify",
    images: [
      {
        url: "https://useselectify.js.org/use-selectify-banner.png",
        width: 1200,
        height: 675,
        alt: "use-selectify cover",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@meetgilberto",
  },
  alternates: {
    canonical: "https://useselectify.js.org",
  },
  category: "technology",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "8C2WRZ6vFGgJSaoWSjDhrgtctV_jVwGGT27yIXn5mFI",
  },
};

const segoeUI = localFont({
  src: "../../public/SegoeUI.woff",
  variable: "--font-segoe",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${segoeUI.variable} ${inter.variable}`}
    >
      <Body>
        <Header />
        <Sidebar />
        <main className="relative col-span-full md:col-span-4">{children}</main>
      </Body>
    </html>
  );
}
