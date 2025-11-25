import { PropsWithChildren } from 'react';

import { AppSidebar } from '@/components/app/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grow overflow-x-hidden bg-zinc-50 font-sans dark:bg-black">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
