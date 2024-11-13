'use client';

import { navs } from '@/config/navs';
import useGlobalStore from '@/config/use-global';
import { Logout } from '@/utils/common';
import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar';
import { Button } from '@shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const t = useTranslations('menu');
  const { user, setUser } = useGlobalStore();
  const router = useRouter();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='default'>
            <Avatar className='size-8'>
              <AvatarImage alt={user?.avatar ?? ''} src={user?.avatar ?? ''} />
              <AvatarFallback className='rounded-none bg-transparent'>
                {user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent forceMount align='end' className='w-56'>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-muted-foreground text-xs leading-none'>ID: {user?.id}</p>
              <p className='text-sm font-medium leading-none'>{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navs.map((nav) => (
            <DropdownMenuGroup key={nav.title}>
              {/* {nav.items && <DropdownMenuLabel>{t(nav.title)}</DropdownMenuLabel>} */}
              {(nav.items || [nav]).map((item) => (
                <DropdownMenuItem
                  key={item.title}
                  onClick={() => {
                    router.push(`${item.url}`);
                  }}
                >
                  <Icon className='mr-2 size-4 flex-none' icon={item.icon!} />
                  <span className='truncate'>{t(item.title)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              Logout();
              setUser();
            }}
          >
            <Icon className='mr-2 size-4 flex-none' icon='uil:exit' />

            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
