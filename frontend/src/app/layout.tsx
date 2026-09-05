import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Urban Furniture — Accounting System",
  description: "Double-entry accounting system for recording transactions, managing masters and generating financial reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <body className="antialiased overflow-hidden h-screen flex">
        <Providers>
          <TooltipProvider>
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
              <TopHeader />
              <main className="flex-1 overflow-y-auto p-5 bg-background">
                {children}
              </main>
            </div>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
