import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/site-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeBootstrap = `(function(){try{var saved=localStorage.getItem("site-theme");document.documentElement.classList.toggle("dark",saved==="dark");}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Social Development Events Platform",
  description: "Discover, create, and join events that make communities stronger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body className="min-h-full flex flex-col"><SiteChrome>{children}</SiteChrome></body>
    </html>
  );
}
