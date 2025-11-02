import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Keuanganku",
  description: "A simple personal finance management app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}

