'use client';

import { Display } from '@/components/display';
import { getUserDetail } from '@/services/admin/user';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@workspace/ui/components/hover-card';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export function UserDetail({ id }: { id: number }) {
  const t = useTranslations('user');
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data } = useQuery({
    enabled: id !== 0 && shouldFetch,
    queryKey: ['getUserDetail', id],
    queryFn: async () => {
      const { data } = await getUserDetail({ id });
      return data.data;
    },
  });

  if (!id) return '--';

  return (
    <HoverCard>
      <HoverCardTrigger asChild onMouseEnter={() => setShouldFetch(true)}>
        <Button variant='link' className='p-0' asChild>
          <Link href={`/dashboard/user/${id}`}>
            {data?.auth_methods[0]?.auth_identifier || t('loading')}
          </Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className='grid gap-3'>
          <ul className='grid gap-3'>
            <li className='flex items-center justify-between font-semibold'>
              <span className='text-muted-foreground'>ID</span>
              <span>{data?.id}</span>
            </li>
            <li className='flex items-center justify-between font-semibold'>
              <span className='text-muted-foreground'>{t('balance')}</span>
              <span>
                <Display type='currency' value={data?.balance} />
              </span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('giftAmount')}</span>
              <span>
                <Display type='currency' value={data?.gift_amount} />
              </span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('commission')}</span>
              <span>
                <Display type='currency' value={data?.commission} />
              </span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('createdAt')}</span>
              <span>{data?.created_at && formatDate(data?.created_at)}</span>
            </li>
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
