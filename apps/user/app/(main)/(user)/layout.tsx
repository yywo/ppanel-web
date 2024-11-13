import { ScrollArea } from '@shadcn/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@shadcn/ui/sidebar';
import { SidebarLeft } from './sidebar-left';
import { SidebarRight } from './sidebar-right';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className='container'>
      <SidebarLeft className='sticky top-[84px] hidden w-52 border-r-0 bg-transparent lg:flex' />
      <SidebarInset className='flex-grow overflow-hidden'>
        {/* <Header /> */}
        <div className='flex h-[calc(100vh-56px)] flex-1 flex-col gap-4 p-4'>
          <ScrollArea className='h-full flex-grow overflow-hidden'>{children}</ScrollArea>
        </div>
      </SidebarInset>
      <SidebarRight className='sticky top-[84px] hidden w-52 border-r-0 bg-transparent lg:flex' />
    </SidebarProvider>
  );
}
