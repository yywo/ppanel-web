'use client';

import { navs } from '@/config/navs';
import useGlobalStore from '@/config/use-global';
import { Logout } from '@/utils/common';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Icon } from '@workspace/ui/custom-components/icon';
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
          <div className="flex items-center gap-2 rounded-full border bg-background px-2 py-1.5 hover:bg-accent transition-colors duration-200 cursor-pointer">
            <Avatar className="h-6 w-6">
              <AvatarImage
                alt={user?.avatar ?? ''}
                src={user?.auth_methods?.[0]?.auth_identifier ?? ''}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-background font-medium">
                {user?.auth_methods?.[0]?.auth_identifier.toUpperCase().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm max-w-[40px] sm:max-w-[100px] truncate">
              {user?.auth_methods?.[0]?.auth_identifier.split('@')[0]}
            </span>
            <Icon icon="lucide:chevron-down" className="size-4 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent forceMount align="end" className="w-64">
          <div className="flex items-center justify-start gap-2 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                alt={user?.avatar ?? ''}
                src={user?.avatar ?? ''}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-background">
                {user?.auth_methods?.[0]?.auth_identifier.toUpperCase().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {user?.auth_methods?.[0]?.auth_identifier.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.auth_methods?.[0]?.auth_identifier}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          {navs.map((nav) => (
            <DropdownMenuGroup key={nav.title}>
              {(nav.items || [nav]).map((item) => (
                <DropdownMenuItem
                  key={item.title}
                  onClick={() => {
                    router.push(`${item.url}`);
                  }}
                  className="flex items-center gap-2 py-2 cursor-pointer"
                >
                  <Icon className="size-4 flex-none text-muted-foreground" icon={item.icon!} />
                  <span className="flex-grow truncate">{t(item.title)}</span>
                  <Icon icon="lucide:chevron-right" className="size-4 text-muted-foreground opacity-50" />
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
            className="flex items-center gap-2 py-2 text-destructive focus:text-destructive cursor-pointer"
          >
            <Icon className="size-4 flex-none" icon="uil:exit" />
            <span className="flex-grow">{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
