'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { useTranslations } from 'next-intl';
import React, { useCallback } from 'react';

interface DurationSelectorProps {
  quantity: number;
  unitTime?: string;
  discounts?: Array<{ quantity: number; discount: number }>;
  onChange: (value: number) => void;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  quantity,
  unitTime = 'Month',
  discounts = [],
  onChange,
}) => {
  const t = useTranslations('subscribe');
  const handleChange = useCallback(
    (value: string) => {
      onChange(Number(value));
    },
    [onChange],
  );

  const DurationOption: React.FC<{ value: string; label: string; discount?: number }> = ({
    value,
    label,
    discount,
  }) => (
    <div className='relative'>
      <RadioGroupItem value={value} id={value} className='peer sr-only' />
      <Label
        htmlFor={value}
        className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary relative flex h-full flex-col items-center justify-center gap-2 rounded-md border-2 p-2'
      >
        {label}
        {discount && <Badge variant='destructive'>-{discount}%</Badge>}
      </Label>
    </div>
  );

  return (
    <>
      <div className='font-semibold'>{t('purchaseDuration')}</div>
      <RadioGroup
        value={String(quantity)}
        onValueChange={handleChange}
        className='flex flex-wrap gap-3'
      >
        {unitTime !== 'Minute' && <DurationOption value='1' label={`1 / ${t(unitTime)}`} />}
        {discounts?.map((item) => (
          <DurationOption
            key={item.quantity}
            value={String(item.quantity)}
            label={`${item.quantity} / ${t(unitTime)}`}
            discount={100 - item.discount}
          />
        ))}
      </RadioGroup>
    </>
  );
};

export default DurationSelector;
