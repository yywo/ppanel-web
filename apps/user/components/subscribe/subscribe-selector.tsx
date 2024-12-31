'use client';

import { Display } from '@/components/display';
import useGlobalStore from '@/config/use-global';
import { Combobox } from '@workspace/ui/custom-components/combobox';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo } from 'react';

interface SubscribeSelectorProps {
  value?: number;
  data: API.SubscribeDiscountInfo[];
  onChange: (value: number) => void;
}

const SubscribeSelector: React.FC<SubscribeSelectorProps> = ({ value, data, onChange }) => {
  const t = useTranslations('subscribe');
  const { common } = useGlobalStore();
  const singleModel = common.subscribe.single_model;

  useEffect(() => {
    if (singleModel && data.length > 0 && data[0]) {
      onChange(data[0].id);
    }
  }, [data, singleModel, onChange, value]);

  const handleChange = useCallback(
    (selectedValue: number) => {
      if (singleModel) {
        if (selectedValue) {
          onChange(selectedValue);
        }
      } else {
        onChange(selectedValue);
      }
    },
    [singleModel, onChange],
  );

  const options = useMemo(() => {
    return data.map((item) => ({
      children: (
        <div className='flex w-full items-center justify-between px-2 py-1.5'>
          <div className='mr-2 flex flex-col overflow-hidden'>
            <span className='truncate text-sm font-medium'>{item.name}</span>
            <time
              className='text-muted-foreground truncate text-xs'
              title={formatDate(new Date(item.expire_time))}
            >
              {formatDate(new Date(item.expire_time), false)}
            </time>
          </div>
          <span className='text-muted-foreground flex-shrink-0 text-sm' title='Price'>
            <Display value={item.price} type='currency' />
          </span>
        </div>
      ),
      label: item.name,
      value: item.id,
    }));
  }, [data]);

  if (!data.length) return null;

  return (
    <>
      <div className='font-semibold'>{t('subscriptionDiscount')}</div>
      <Combobox<number, false>
        placeholder={t('selectSubscription')}
        options={options}
        value={value}
        onChange={handleChange}
      />
    </>
  );
};

export default SubscribeSelector;
