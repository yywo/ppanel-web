'use client';

import { getAvailablePaymentMethods } from '@/services/user/portal';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { memo } from 'react';

interface PaymentMethodsProps {
  value: number;
  onChange: (value: number) => void;
  balance?: boolean;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ value, onChange, balance = true }) => {
  const t = useTranslations('subscribe');

  const { data } = useQuery({
    queryKey: ['getAvailablePaymentMethods', { balance }],
    queryFn: async () => {
      const { data } = await getAvailablePaymentMethods();
      const methods = data.data?.list || [];
      if (!value && methods[0]?.id) onChange(methods[0]?.id);
      if (balance) return methods;
      return methods.filter((item) => item.id !== -1);
    },
  });
  return (
    <>
      <div className='font-semibold'>{t('paymentMethod')}</div>
      <RadioGroup
        className='grid grid-cols-2 gap-2 md:grid-cols-5'
        value={String(value)}
        onValueChange={(val) => onChange(Number(val))}
      >
        {data?.map((item) => (
          <div key={item.id}>
            <RadioGroupItem value={String(item.id)} id={String(item.id)} className='peer sr-only' />
            <Label
              htmlFor={String(item.id)}
              className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary flex flex-col items-center justify-between rounded-md border-2 py-2'
            >
              <div className='mb-3 size-12'>
                <Image
                  src={item.icon || `/payment/balance.svg`}
                  width={48}
                  height={48}
                  alt={item.name}
                />
              </div>
              <span className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-center'>
                {item.name}
              </span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </>
  );
};

export default memo(PaymentMethods);
