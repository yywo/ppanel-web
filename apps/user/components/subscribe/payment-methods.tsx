'use client';

import { getAvailablePaymentMethods } from '@/services/user/portal';
// import { getAvailablePaymentMethods } from '@/services/user/payment';
// import { getAvailablePaymentMethods } from '@/services/user/payment';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { memo } from 'react';

interface PaymentMethodsProps {
  value: string;
  onChange: (value: string) => void;
  balance?: boolean;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ value, onChange, balance = true }) => {
  const t = useTranslations('subscribe');

  const { data } = useQuery({
    queryKey: ['getAvailablePaymentMethods', { balance }],
    queryFn: async () => {
      const { data } = await getAvailablePaymentMethods();
      const methods = data.data?.list || [];
      if (!value && methods[0]?.mark) onChange(methods[0]?.mark);
      if (balance) return methods;
      return methods.filter((item) => item.mark !== 'balance');
    },
  });
  return (
    <>
      <div className='font-semibold'>{t('paymentMethod')}</div>
      <RadioGroup
        className='grid grid-cols-2 gap-2 md:grid-cols-5'
        value={value}
        onValueChange={onChange}
      >
        {data?.map((item) => (
          <div key={item.mark}>
            <RadioGroupItem value={item.mark} id={item.mark} className='peer sr-only' />
            <Label
              htmlFor={item.mark}
              className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary flex flex-col items-center justify-between rounded-md border-2 py-2'
            >
              <div className='mb-3 size-12'>
                <Image
                  src={item.icon || `/payment/${item.mark}.svg`}
                  width={48}
                  height={48}
                  alt={item.name || t(`methods.${item.mark}`)}
                />
              </div>
              <span className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-center'>
                {item.name || t(`methods.${item.mark}`)}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </>
  );
};

export default memo(PaymentMethods);
