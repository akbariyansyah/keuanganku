import { ReactNode } from 'react';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex">
        <header className="flex h-14 w-full items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
