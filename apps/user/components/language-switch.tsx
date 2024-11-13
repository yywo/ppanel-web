'use client';

import { locales } from '@/config/constants';
import { setLocale } from '@/utils/common';
import { Icon } from '@iconify/react';
import { getCountry } from '@repo/ui/utils';
import { Button } from '@shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function LanguageSwitch() {
  const locale = useLocale();
  const country = getCountry(locale);
  const t = useTranslations('language');
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Icon icon={`flagpack:${country?.alpha2.toLowerCase()}`} className='!size-5' />
          <span className='sr-only'>Switch Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {locales.map(getCountry).map((item) => (
          <DropdownMenuItem
            key={`${item?.lang}-${item?.alpha2}`}
            onClick={() => {
              setLocale(`${item?.lang}-${item?.alpha2}`);
              router.refresh();
            }}
          >
            <div className='flex items-center gap-1'>
              <Icon icon={`flagpack:${item?.alpha2.toLowerCase()}`} />
              {t(`${item?.lang}-${item?.alpha2}`)}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
