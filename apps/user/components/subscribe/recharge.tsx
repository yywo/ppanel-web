'use client';

import useGlobalStore from '@/config/use-global';
import { recharge } from '@/services/user/order';
import { getAvailablePaymentMethods } from '@/services/user/payment';
import { useQuery } from '@tanstack/react-query';
import { Button, ButtonProps } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { unitConversion } from '@workspace/ui/utils';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export default function Recharge(props: Readonly<ButtonProps>) {
  const t = useTranslations('subscribe');
  const { common } = useGlobalStore();
  const { currency } = common;

  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [loading, startTransition] = useTransition();

  const [params, setParams] = useState<API.RechargeOrderRequest>({
    amount: 0,
    payment: '',
  });

  const { data: paymentMethods } = useQuery({
    enabled: open,
    queryKey: ['getAvailablePaymentMethods'],
    queryFn: async () => {
      const { data } = await getAvailablePaymentMethods();
      return data.data?.list || [];
    },
  });

  useEffect(() => {
    if (paymentMethods?.length) {
      setParams((prev) => ({
        ...prev,
        payment: paymentMethods.find((item) => item.mark !== 'balance')?.mark as string,
      }));
    }
  }, [paymentMethods]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props}>{t('recharge')}</Button>
      </DialogTrigger>
      <DialogContent className='flex h-full flex-col overflow-hidden md:h-auto'>
        <DialogHeader>
          <DialogTitle>{t('balanceRecharge')}</DialogTitle>
          <DialogDescription>{t('rechargeDescription')}</DialogDescription>
        </DialogHeader>
        <div className='flex flex-col justify-between text-sm'>
          <div className='grid gap-3'>
            <div className='font-semibold'>{t('rechargeAmount')}</div>
            <div className='flex'>
              <EnhancedInput
                type='number'
                placeholder={t('enterAmount')}
                min={0}
                value={params.amount}
                formatInput={(value) => unitConversion('centsToDollars', value)}
                formatOutput={(value) => unitConversion('dollarsToCents', value)}
                onValueChange={(value) => {
                  setParams((prev) => ({
                    ...prev,
                    amount: value as number,
                  }));
                }}
                prefix={currency.currency_symbol}
                suffix={currency.currency_unit}
              />
            </div>
            <div className='font-semibold'>{t('paymentMethod')}</div>
            <RadioGroup
              className='grid grid-cols-5 gap-2'
              value={params.payment}
              onValueChange={(value) => {
                setParams({
                  ...params,
                  payment: value,
                });
              }}
            >
              {paymentMethods
                ?.filter((item) => item.mark !== 'balance')
                ?.map((item) => {
                  return (
                    <div key={item.mark}>
                      <RadioGroupItem value={item.mark} id={item.mark} className='peer sr-only' />
                      <Label
                        htmlFor={item.mark}
                        className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 py-2'
                      >
                        <div className='mb-3 size-12'>
                          <Image
                            src={item.icon || `/payment/${item.mark}.svg`}
                            width={48}
                            height={48}
                            alt={item.name!}
                          />
                        </div>
                        <span className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-center'>
                          {item.name || t(`methods.${item.mark}`)}
                        </span>
                      </Label>
                    </div>
                  );
                })}
            </RadioGroup>
          </div>
          <Button
            className='fixed bottom-0 left-0 w-full rounded-none md:relative md:mt-6'
            disabled={loading || !params.amount}
            onClick={() => {
              startTransition(async () => {
                try {
                  const response = await recharge(params);
                  const orderNo = response.data.data?.order_no;
                  if (orderNo) {
                    router.push(`/payment?order_no=${orderNo}`);
                    setOpen(false);
                  }
                } catch (error) {
                  /* empty */
                }
              });
            }}
          >
            {loading && <LoaderCircle className='mr-2 animate-spin' />}
            {t('rechargeNow')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
