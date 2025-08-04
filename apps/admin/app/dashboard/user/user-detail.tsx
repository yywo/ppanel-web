'use client';

import { Display } from '@/components/display';
import { getUserDetail, getUserSubscribeById } from '@/services/admin/user';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@workspace/ui/components/hover-card';
import { formatBytes, formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function UserSubscribeDetail({ id, enabled }: { id: number; enabled: boolean }) {
  const t = useTranslations('user');

  const { data } = useQuery({
    enabled: id !== 0 && enabled,
    queryKey: ['getUserSubscribeById', id],
    queryFn: async () => {
      const { data } = await getUserSubscribeById({ id });
      return data.data;
    },
  });

  if (!id) return '--';

  const usedTraffic = data ? data.upload + data.download : 0;
  const totalTraffic = data?.traffic || 0;

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='mb-2 text-sm font-medium'>{t('subscriptionInfo')}</h3>
        <div className='bg-muted/30 rounded-lg p-3'>
          <ul className='grid gap-3'>
            <li className='flex items-center justify-between font-semibold'>
              <span className='text-muted-foreground'>{t('subscriptionId')}</span>
              <span>{data?.id || '--'}</span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('subscriptionName')}</span>
              <span>{data?.subscribe?.name || '--'}</span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('token')}</span>
              <div className='font-mono text-xs' title={data?.token || ''}>
                {data?.token || '--'}
              </div>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('trafficUsage')}</span>
              <span>
                {data
                  ? totalTraffic === 0
                    ? `${formatBytes(usedTraffic)} / ${t('unlimited')}`
                    : `${formatBytes(usedTraffic)} / ${formatBytes(totalTraffic)}`
                  : '--'}
              </span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('startTime')}</span>
              <span>{data?.start_time ? formatDate(data.start_time) : '--'}</span>
            </li>
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>{t('expireTime')}</span>
              <span>{data?.expire_time ? formatDate(data.expire_time) : '--'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h3 className='mb-2 text-sm font-medium'>
          {t('userInfo')}
          {data?.user_id && (
            <Button
              variant='link'
              size='sm'
              className='text-primary ml-2 h-auto p-0 text-xs'
              asChild
            >
              <Link href={`/dashboard/user/${data.user_id}`}>{t('viewDetails')}</Link>
            </Button>
          )}
        </h3>
        <ul className='grid gap-3'>
          <li className='flex items-center justify-between font-semibold'>
            <span className='text-muted-foreground'>{t('userId')}</span>
            <span>{data?.user_id}</span>
          </li>
          <li className='flex items-center justify-between font-semibold'>
            <span className='text-muted-foreground'>{t('balance')}</span>
            <span>
              <Display type='currency' value={data?.user.balance} />
            </span>
          </li>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>{t('giftAmount')}</span>
            <span>
              <Display type='currency' value={data?.user?.gift_amount} />
            </span>
          </li>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>{t('commission')}</span>
            <span>
              <Display type='currency' value={data?.user?.commission} />
            </span>
          </li>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>{t('createdAt')}</span>
            <span>{data?.user?.created_at && formatDate(data?.user?.created_at)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function UserDetail({ id }: { id: number }) {
  const t = useTranslations('user');

  const { data } = useQuery({
    enabled: id !== 0,
    queryKey: ['getUserDetail', id],
    queryFn: async () => {
      const { data } = await getUserDetail({ id });
      return data.data;
    },
  });

  if (!id) return '--';

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
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
