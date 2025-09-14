'use client';
import { navs } from '@/config/navs';
import useGlobalStore from '@/config/use-global';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@workspace/ui/components/hover-card';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

type Nav = (typeof navs)[number];

function hasChildren(obj: any): obj is { items: any[] } {
  return obj && Array.isArray((obj as any).items) && (obj as any).items.length > 0;
}

export function SidebarLeft({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { common } = useGlobalStore();
  const { site } = common;
  const t = useTranslations('menu');
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();

  const logsGroupTitle = 'Logs & Analytics';
  const systemGroupTitle = 'System';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const groups: Record<string, boolean> = {};
    (navs as typeof navs).forEach((nav) => {
      if (hasChildren(nav)) {
        // Default: open all groups except Logs & Analytics and System
        groups[nav.title] = nav.title !== logsGroupTitle && nav.title !== systemGroupTitle;
      }
    });
    return groups;
  });

  const handleToggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const normalize = (p: string) => (p.endsWith('/') && p !== '/' ? p.replace(/\/+$/, '') : p);
  const isActiveUrl = (url: string) => {
    const path = normalize(pathname);
    const target = normalize(url);
    if (target === '/dashboard') return path === target;
    if (path === target) return true;
    // Only treat as active if next char is a path boundary '/'
    return path.startsWith(target + '/');
  };

  const isGroupActive = (nav: Nav) =>
    (hasChildren(nav) && nav.items.some((i: any) => isActiveUrl(i.url))) ||
    ('url' in nav && nav.url ? isActiveUrl(nav.url as string) : false);

  // Ensure the group containing the active route is open, without closing others
  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      (navs as typeof navs).forEach((nav) => {
        if (hasChildren(nav) && isGroupActive(nav)) next[nav.title] = true;
      });
      return next;
    });
  }, [pathname]);

  const renderCollapsedFlyout = (nav: Nav) => {
    const ParentButton = (
      <SidebarMenuButton
        size='sm'
        className='h-8 justify-center'
        isActive={false}
        aria-label={t(nav.title)}
      >
        {'url' in nav && nav.url ? (
          <Link href={nav.url as string}>
            {'icon' in nav && (nav as any).icon ? (
              <Icon icon={(nav as any).icon} className='size-4' />
            ) : null}
          </Link>
        ) : (
          <>
            {'icon' in nav && (nav as any).icon ? (
              <Icon icon={(nav as any).icon} className='size-4' />
            ) : null}
          </>
        )}
      </SidebarMenuButton>
    );

    if (!hasChildren(nav)) return ParentButton;

    return (
      <HoverCard openDelay={40} closeDelay={200}>
        <HoverCardTrigger asChild>{ParentButton}</HoverCardTrigger>
        <HoverCardContent
          side='right'
          align='start'
          sideOffset={10}
          className='z-[9999] w-64 p-0'
          avoidCollisions
          collisionPadding={8}
        >
          <div className='flex items-center gap-2 border-b px-3 py-2'>
            {'icon' in nav && (nav as any).icon ? (
              <Icon icon={(nav as any).icon} className='size-4' />
            ) : null}
            <span className='text-muted-foreground truncate text-xs font-medium'>
              {t(nav.title)}
            </span>
          </div>

          <ul className='p-1'>
            {nav.items.map((item: any) => (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className={[
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                    isActiveUrl(item.url)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/60',
                  ].join(' ')}
                >
                  {item.icon && <Icon icon={item.icon} className='size-4' />}
                  <span className='truncate'>{t(item.title)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
    );
  };

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
          {!isMobile && state === 'collapsed'
            ? (navs as typeof navs).map((nav) => (
                <SidebarMenuItem key={nav.title} className='mx-auto'>
                  {renderCollapsedFlyout(nav)}
                </SidebarMenuItem>
              ))
            : (navs as typeof navs).map((nav) => {
                if (hasChildren(nav)) {
                  const isOpen = openGroups[nav.title] ?? false;
                  const groupActive = isGroupActive(nav);
                  return (
                    <SidebarGroup key={nav.title} className={cn('py-1')}>
                      <SidebarMenuButton
                        size='sm'
                        // className={cn('mb-2 flex h-8 w-full items-center justify-between', {
                        //   'bg-accent text-accent-foreground': isOpen || groupActive,
                        //   'hover:bg-accent/60': !isOpen && !groupActive,
                        // })}
                        className={cn(
                          'hover:bg-accent/60 hover:text-accent-foreground mb-2 flex h-8 w-full items-center justify-between',
                        )}
                        onClick={() => handleToggleGroup(nav.title)}
                        tabIndex={0}
                        style={{ fontWeight: 500 }}
                        isActive={false}
                      >
                        <span className='flex min-w-0 items-center gap-2'>
                          {'icon' in nav && (nav as any).icon ? (
                            <Icon icon={(nav as any).icon} className='size-4 shrink-0' />
                          ) : null}
                          <span className='truncate text-sm'>{t(nav.title)}</span>
                        </span>
                        <Icon
                          icon='mdi:chevron-down'
                          className={`ml-2 size-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                        />
                      </SidebarMenuButton>
                      {isOpen && (
                        <SidebarGroupContent className='px-4'>
                          <SidebarMenu>
                            {nav.items.map((item: any) => (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  asChild
                                  size='sm'
                                  className='h-8'
                                  tooltip={t(item.title)}
                                  isActive={isActiveUrl(item.url)}
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
                      )}
                    </SidebarGroup>
                  );
                }

                return (
                  <SidebarGroup key={nav.title} className='py-1'>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild={'url' in nav && !!(nav as any).url}
                            size='sm'
                            className='h-8'
                            tooltip={t(nav.title)}
                            isActive={
                              'url' in nav && (nav as any).url
                                ? isActiveUrl((nav as any).url)
                                : false
                            }
                          >
                            {'url' in nav && (nav as any).url ? (
                              <Link href={(nav as any).url}>
                                {'icon' in nav && (nav as any).icon ? (
                                  <Icon icon={(nav as any).icon} className='size-4' />
                                ) : null}
                                <span className='text-sm'>{t(nav.title)}</span>
                              </Link>
                            ) : (
                              <>
                                {'icon' in nav && (nav as any).icon ? (
                                  <Icon icon={(nav as any).icon} className='size-4' />
                                ) : null}
                                <span className='text-sm'>{t(nav.title)}</span>
                              </>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
