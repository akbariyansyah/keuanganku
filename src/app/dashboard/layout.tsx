import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Providers from "../providers";

import { ReactNode } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = {
  title: "Keuanganku",
  description: "A simple personal finance management app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div style={{ display: "flex" }}>
            <AppSidebar />
            <main style={{ flex: 1, padding: 10 }}>
              <SidebarTrigger />
              <Providers>{children}</Providers>
            </main>
          </div>

        </SidebarProvider>
      </body>
    </html>
  )
}