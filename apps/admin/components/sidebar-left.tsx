'use client';
import { navs } from '@/config/navs';
import useGlobalStore from '@/config/use-global';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { common } = useGlobalStore();
  const { site } = common;
  const t = useTranslations('menu');
  const pathname = usePathname();
  return (
    <Sidebar className='border-r-0' collapsible='icon' {...props}>
      <SidebarHeader className='p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='sm' asChild className='h-10'>
              <Link href='/'>
                <div className='flex aspect-square size-6 items-center justify-center rounded-lg'>
                  <Image
                    src={site.site_logo || '/favicon.svg'}
                    alt='logo'
                    width={24}
                    height={24}
                    className='size-full'
                    unoptimized
                  />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate text-xs font-semibold'>{site.site_name}</span>
                  <span className='truncate text-xs opacity-70'>{site.site_desc}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='py-2'>
        <SidebarMenu>
          {navs.map((nav) => (
            <SidebarGroup key={nav.title} className='py-1'>
              {nav.items && (
                <SidebarGroupLabel className='py-1 text-xs'>{t(nav.title)}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {(nav.items || [nav]).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        size='sm'
                        tooltip={t(item.title)}
                        className='h-8'
                        isActive={
                          item.url === '/dashboard'
                            ? pathname === item.url
                            : pathname.startsWith(item.url)
                        }
                      >
                        <Link href={item.url}>
                          {item.icon && <Icon icon={item.icon} className='size-4' />}
                          <span className='text-sm'>{t(item.title)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
