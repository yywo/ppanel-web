import { Header } from '@/components/header';
import { SidebarLeft } from '@/components/sidebar-left';
import { ScrollArea } from '@shadcn/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@shadcn/ui/sidebar';
import { cookies } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarLeft />
      <SidebarInset className='flex-grow overflow-hidden'>
        <Header />
        <div className='flex h-[calc(100vh-56px)] flex-1 flex-col gap-4 p-4'>
          <ScrollArea className='h-full flex-grow overflow-hidden'>{children}</ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
