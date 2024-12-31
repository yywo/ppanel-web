'use client';

import { Display } from '@/components/display';
import { useTranslations } from 'next-intl';

export function SubscribeDetail({
  subscribe,
}: {
  subscribe?: Partial<
    API.Subscribe & {
      name: string;
      quantity: number;
    }
  >;
}) {
  const t = useTranslations('subscribe.detail');

  return (
    <>
      <div className='font-semibold'>{t('productDetail')}</div>
      <ul className='grid grid-cols-2 gap-3 *:flex *:items-center *:justify-between lg:grid-cols-1'>
        {subscribe?.name && (
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground line-clamp-2 flex-1'>{subscribe?.name}</span>
            <span>
              x <span>{subscribe?.quantity || 1}</span>
            </span>
          </li>
        )}
        <li>
          <span className='text-muted-foreground'>{t('availableTraffic')}</span>
          <span>
            <Display type='traffic' value={subscribe?.traffic} unlimited />
          </span>
        </li>
        <li>
          <span className='text-muted-foreground'>{t('connectionSpeed')}</span>
          <span>
            <Display type='traffic' value={subscribe?.speed_limit} unlimited />
          </span>
        </li>
        <li>
          <span className='text-muted-foreground'>{t('connectedDevices')}</span>
          <span>
            <Display value={subscribe?.device_limit} type='number' unlimited />
          </span>
        </li>
      </ul>
    </>
  );
}
