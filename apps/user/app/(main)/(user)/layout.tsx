import { SidebarInset, SidebarProvider } from '@shadcn/ui/sidebar';
import { SidebarLeft } from './sidebar-left';
import { SidebarRight } from './sidebar-right';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className='container'>
      <SidebarLeft className='sticky top-[84px] hidden w-52 border-r-0 bg-transparent lg:flex' />
      <SidebarInset className='relative p-4'>{children}</SidebarInset>
      <SidebarRight className='sticky top-[84px] hidden w-52 border-r-0 bg-transparent 2xl:flex' />
    </SidebarProvider>
  );
}
