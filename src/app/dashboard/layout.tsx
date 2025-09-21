import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: "flex" }}>
        <AppSidebar />
        <main style={{ flex: 1, padding: 10 }}>
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
