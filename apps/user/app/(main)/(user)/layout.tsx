import { SidebarInset, SidebarProvider } from '@shadcn/ui/sidebar';
import { SidebarLeft } from './sidebar-left';
import { SidebarRight } from './sidebar-right';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className='container'>
      <SidebarLeft className='sticky top-[84px] hidden w-52 border-r-0 bg-transparent lg:flex' />
      <SidebarInset className='relative flex-grow overflow-hidden'>
        {/* <Header /> */}
        <div className='overflow-auto p-4'>{children}</div>
      </SidebarInset>
      <SidebarRight className='sticky top-[84px] hidden w-52 border-r-0 bg-transparent lg:flex' />
    </SidebarProvider>
  );
}
