'use client';

import { getNodeGroupList, getNodeList } from '@/services/admin/server';
import { getSubscribeGroupList } from '@/services/admin/subscribe';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Label } from '@workspace/ui/components/label';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Switch } from '@workspace/ui/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Combobox } from '@workspace/ui/custom-components/combobox';
import { ArrayInput } from '@workspace/ui/custom-components/dynamic-Inputs';
import { JSONEditor } from '@workspace/ui/custom-components/editor';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { evaluateWithPrecision, unitConversion } from '@workspace/ui/utils';
import { CreditCard, Server, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { assign, shake } from 'radash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface SubscribeFormProps<T> {
  onSubmit: (data: T) => Promise<boolean> | boolean;
  initialValues?: T;
  loading?: boolean;
  trigger: string;
  title: string;
}

const defaultValues = {
  inventory: 0,
  speed_limit: 0,
  device_limit: 0,
  traffic: 0,
  quota: 0,
  discount: [],
  server_group: [],
  server: [],
  unit_time: 'Month',
  deduction_ratio: 0,
  purchase_with_discount: false,
  reset_cycle: 0,
  renewal_reset: false,
  deduction_mode: 'auto',
};

export default function SubscribeForm<T extends Record<string, any>>({
  onSubmit,
  initialValues,
  loading,
  trigger,
  title,
}: Readonly<SubscribeFormProps<T>>) {
  const t = useTranslations('product');
  const [open, setOpen] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    unit_price: z.number(),
    unit_time: z.string().default('Month'),
    replacement: z.number().optional(),
    discount: z
      .array(
        z.object({
          quantity: z.number(),
          discount: z.number(),
        }),
      )
      .optional(),
    inventory: z.number().optional().default(-1),
    speed_limit: z.number().optional().default(0),
    device_limit: z.number().optional().default(0),
    traffic: z.number().optional().default(0),
    quota: z.number().optional().default(0),
    group_id: z.number().optional().nullish(),
    server_group: z.array(z.number()).optional().default([]),
    server: z.array(z.number()).optional().default([]),
    deduction_ratio: z.number().optional().default(0),
    allow_deduction: z.boolean().optional().default(false),
    reset_cycle: z.number().optional().default(0),
    renewal_reset: z.boolean().optional().default(false),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: assign(
      defaultValues,
      shake(initialValues, (value) => value === null) as Record<string, any>,
    ),
  });

  const debouncedCalculateDiscount = useCallback(
    (values: any[], fieldName: string, lastChangedField?: string, changedIndex?: number) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        const { unit_price } = form.getValues();
        if (!unit_price || !values?.length) return;

        let hasChanges = false;
        const calculatedValues = values.map((item: any, index: number) => {
          const result = { ...item };

          if (changedIndex !== undefined && index !== changedIndex) {
            return result;
          }

          const quantity = Number(item.quantity) || 0;
          const discount = Number(item.discount) || 0;
          const price = Number(item.price) || 0;

          switch (lastChangedField) {
            case 'quantity':
            case 'discount':
              if (quantity > 0 && discount > 0) {
                const newPrice = evaluateWithPrecision(
                  `${unit_price} * ${quantity} * ${discount} / 100`,
                );
                if (Math.abs(newPrice - price) > 0.01) {
                  result.price = newPrice;
                  hasChanges = true;
                }
              }
              break;

            case 'price':
              if (quantity > 0 && price > 0) {
                const newDiscount = evaluateWithPrecision(
                  `${price} / ${quantity} / ${unit_price} * 100`,
                );
                if (Math.abs(newDiscount - discount) > 0.01) {
                  result.discount = Math.min(100, Math.max(0, newDiscount));
                  hasChanges = true;
                }
              } else if (discount > 0 && price > 0) {
                const newQuantity = evaluateWithPrecision(
                  `${price} / ${unit_price} / ${discount} * 100`,
                );
                if (Math.abs(newQuantity - quantity) > 0.01 && newQuantity > 0) {
                  result.quantity = Math.max(1, Math.round(newQuantity));
                  hasChanges = true;
                }
              }
              break;

            default:
              if (quantity > 0 && discount > 0 && price === 0) {
                result.price = evaluateWithPrecision(
                  `${unit_price} * ${quantity} * ${discount} / 100`,
                );
                hasChanges = true;
              } else if (quantity > 0 && price > 0 && discount === 0) {
                const newDiscount = evaluateWithPrecision(
                  `${price} / ${quantity} / ${unit_price} * 100`,
                );
                result.discount = Math.min(100, Math.max(0, newDiscount));
                hasChanges = true;
              } else if (discount > 0 && price > 0 && quantity === 0) {
                const newQuantity = evaluateWithPrecision(
                  `${price} / ${unit_price} / ${discount} * 100`,
                );
                if (newQuantity > 0) {
                  result.quantity = Math.max(1, Math.round(newQuantity));
                  hasChanges = true;
                }
              }
              break;
          }

          return result;
        });

        if (hasChanges) {
          form.setValue(fieldName, calculatedValues, { shouldDirty: true });
        }
      }, 300);
    },
    [form],
  );

  useEffect(() => {
    form?.reset(
      assign(defaultValues, shake(initialValues, (value) => value === null) as Record<string, any>),
    );
  }, [form, initialValues]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(data: { [x: string]: any }) {
    const bool = await onSubmit(data as T);
    if (bool) setOpen(false);
  }

  const { data: group } = useQuery({
    queryKey: ['getSubscribeGroupList'],
    queryFn: async () => {
      const { data } = await getSubscribeGroupList();
      return data.data?.list as API.SubscribeGroup[];
    },
  });

  const { data: server } = useQuery({
    queryKey: ['getNodeList', 'all'],
    queryFn: async () => {
      const { data } = await getNodeList({
        page: 1,
        size: 9999,
      });
      return data.data?.list;
    },
  });

  const { data: server_groups } = useQuery({
    queryKey: ['getNodeGroupList'],
    queryFn: async () => {
      const { data } = await getNodeGroupList();
      return (data.data?.list || []) as API.ServerGroup[];
    },
  });

  const unit_time = form.watch('unit_time');
  const unit_price = form.watch('unit_price');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            form.reset();
            setOpen(true);
          }}
        >
          {trigger}
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[800px] max-w-full md:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))]'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='pt-4'>
              <Tabs defaultValue='basic' className='w-full'>
                <TabsList className='mb-6 grid w-full grid-cols-3'>
                  <TabsTrigger value='basic' className='flex items-center gap-2'>
                    <Settings className='h-4 w-4' />
                    {t('form.basic')}
                  </TabsTrigger>
                  <TabsTrigger value='pricing' className='flex items-center gap-2'>
                    <CreditCard className='h-4 w-4' />
                    {t('form.pricing')}
                  </TabsTrigger>
                  <TabsTrigger value='servers' className='flex items-center gap-2'>
                    <Server className='h-4 w-4' />
                    {t('form.servers')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='basic' className='space-y-4'>
                  <div className='grid gap-6'>
                    <div className='grid grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.name')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                {...field}
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='group_id'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.groupId')}</FormLabel>
                            <FormControl>
                              <Combobox<number, false>
                                placeholder={t('form.selectSubscribeGroup')}
                                {...field}
                                onChange={(value) => {
                                  form.setValue(field.name, value || 0);
                                }}
                                options={group?.map((item) => ({
                                  label: item.name,
                                  value: item.id,
                                }))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-4'>
                      <FormField
                        control={form.control}
                        name='traffic'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.traffic')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                placeholder={t('form.noLimit')}
                                type='number'
                                {...field}
                                formatInput={(value) => unitConversion('bytesToGb', value)}
                                formatOutput={(value) => unitConversion('gbToBytes', value)}
                                suffix='GB'
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='speed_limit'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.speedLimit')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                placeholder={t('form.noLimit')}
                                type='number'
                                {...field}
                                formatInput={(value) => unitConversion('bitsToMb', value)}
                                formatOutput={(value) => unitConversion('mbToBits', value)}
                                suffix='Mbps'
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='device_limit'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.deviceLimit')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                placeholder={t('form.noLimit')}
                                type='number'
                                step={1}
                                {...field}
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-4'>
                      <FormField
                        control={form.control}
                        name='inventory'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.inventory')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                placeholder={t('form.noLimit')}
                                type='number'
                                step={1}
                                value={field.value}
                                min={0}
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='quota'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.quota')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                placeholder={t('form.noLimit')}
                                type='number'
                                step={1}
                                {...field}
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <JSONEditor
                              title={t('form.description')}
                              value={field.value && JSON.parse(field.value)}
                              onChange={(value) => {
                                form.setValue(field.name, JSON.stringify(value));
                              }}
                              placeholder={{
                                description: 'description',
                                features: [
                                  {
                                    type: 'default',
                                    icon: '',
                                    label: 'label',
                                  },
                                ],
                              }}
                              schema={{
                                type: 'object',
                                properties: {
                                  description: {
                                    type: 'string',
                                    description: 'A brief description of the item.',
                                  },
                                  features: {
                                    type: 'array',
                                    items: {
                                      type: 'object',
                                      properties: {
                                        icon: {
                                          type: 'string',
                                          description:
                                            "Enter an Iconify icon identifier (e.g., 'mdi:account').",
                                          pattern: '^[a-z0-9]+:[a-z0-9-]+$',
                                          examples: [
                                            'uil:shield-check',
                                            'uil:shield-exclamation',
                                            'uil:database',
                                            'uil:server',
                                          ],
                                        },
                                        label: {
                                          type: 'string',
                                          description: 'The label describing the feature.',
                                        },
                                        type: {
                                          type: 'string',
                                          enum: ['default', 'success', 'destructive'],
                                          description:
                                            'The type of feature, limited to specific values.',
                                        },
                                      },
                                    },
                                    description: 'A list of feature objects.',
                                  },
                                },
                                required: ['description', 'features'],
                                additionalProperties: false,
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='pricing' className='space-y-4'>
                  <div className='grid gap-6'>
                    <div className='grid grid-cols-4 gap-4'>
                      <FormField
                        control={form.control}
                        name='unit_price'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.unitPrice')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                type='number'
                                {...field}
                                min={0}
                                formatInput={(value) => unitConversion('centsToDollars', value)}
                                formatOutput={(value) => unitConversion('dollarsToCents', value)}
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='unit_time'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.unitTime')}</FormLabel>
                            <FormControl>
                              <Combobox
                                placeholder={t('form.selectUnitTime')}
                                {...field}
                                onChange={(value) => {
                                  if (value) {
                                    form.setValue(field.name, value);
                                  }
                                }}
                                options={[
                                  { label: t('form.NoLimit'), value: 'NoLimit' },
                                  { label: t('form.Year'), value: 'Year' },
                                  { label: t('form.Month'), value: 'Month' },
                                  { label: t('form.Day'), value: 'Day' },
                                  { label: t('form.Hour'), value: 'Hour' },
                                  { label: t('form.Minute'), value: 'Minute' },
                                ]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='replacement'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.replacement')}</FormLabel>
                            <FormControl>
                              <EnhancedInput
                                type='number'
                                {...field}
                                min={0}
                                formatInput={(value) => unitConversion('centsToDollars', value)}
                                formatOutput={(value) => unitConversion('dollarsToCents', value)}
                                onValueChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='reset_cycle'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('form.resetCycle')}</FormLabel>
                            <FormControl>
                              <Combobox<number, false>
                                placeholder={t('form.selectResetCycle')}
                                {...field}
                                onChange={(value) => {
                                  if (typeof value === 'number') {
                                    form.setValue(field.name, value);
                                  }
                                }}
                                options={[
                                  { label: t('form.noReset'), value: 0 },
                                  { label: t('form.resetOn1st'), value: 1 },
                                  { label: t('form.monthlyReset'), value: 2 },
                                  { label: t('form.annualReset'), value: 3 },
                                ]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name='discount'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.discount')}</FormLabel>
                          <FormControl>
                            <ArrayInput<API.SubscribeDiscount & { price?: number }>
                              fields={[
                                {
                                  name: 'quantity',
                                  type: 'number',
                                  step: 1,
                                  min: 1,
                                  suffix: unit_time && t(`form.${unit_time}`),
                                },
                                {
                                  name: 'discount',
                                  type: 'number',
                                  min: 0.01,
                                  max: 100,
                                  step: 0.01,
                                  placeholder: t('form.discountPercent'),
                                  suffix: '%',
                                },
                                {
                                  name: 'price',
                                  placeholder: t('form.discount_price'),
                                  type: 'number',
                                  min: 0,
                                  step: 0.01,
                                  formatInput: (value) => unitConversion('centsToDollars', value),
                                  formatOutput: (value) => unitConversion('dollarsToCents', value),
                                },
                              ]}
                              value={field.value}
                              onChange={(
                                newValues: (API.SubscribeDiscount & { price?: number })[],
                              ) => {
                                const oldValues = field.value || [];
                                let lastChangedField: string | undefined;
                                let changedIndex: number | undefined;

                                for (
                                  let i = 0;
                                  i < Math.max(newValues.length, oldValues.length);
                                  i++
                                ) {
                                  const newItem = newValues[i] || {};
                                  const oldItem = oldValues[i] || {};

                                  if ((newItem as any).quantity !== (oldItem as any).quantity) {
                                    lastChangedField = 'quantity';
                                    changedIndex = i;
                                    break;
                                  }
                                  if ((newItem as any).discount !== (oldItem as any).discount) {
                                    lastChangedField = 'discount';
                                    changedIndex = i;
                                    break;
                                  }
                                  if ((newItem as any).price !== (oldItem as any).price) {
                                    lastChangedField = 'price';
                                    changedIndex = i;
                                    break;
                                  }
                                }
                                form.setValue(field.name, newValues, { shouldDirty: true });
                                if (newValues?.length > 0) {
                                  debouncedCalculateDiscount(
                                    newValues,
                                    field.name,
                                    lastChangedField,
                                    changedIndex,
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>{t('form.discountDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='deduction_ratio'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.deductionRatio')}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              type='number'
                              {...field}
                              min={0}
                              max={100}
                              placeholder='Auto'
                              suffix='%'
                              onValueChange={(value) => {
                                form.setValue(field.name, value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>{t('form.deductionRatioDescription')}</FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='renewal_reset'
                      render={({ field }) => (
                        <FormItem>
                          <div className='flex items-center justify-between'>
                            <div className='space-y-0.5'>
                              <FormLabel>{t('form.renewalReset')}</FormLabel>
                              <FormDescription>{t('form.renewalResetDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='allow_deduction'
                      render={({ field }) => (
                        <FormItem>
                          <div className='flex items-center justify-between'>
                            <div className='space-y-0.5'>
                              <FormLabel>{t('form.purchaseWithDiscount')}</FormLabel>
                              <FormDescription>
                                {t('form.purchaseWithDiscountDescription')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={!!field.value}
                                onCheckedChange={(value) => {
                                  form.setValue(field.name, value);
                                }}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value='servers' className='space-y-4'>
                  <div className='space-y-6'>
                    <FormField
                      control={form.control}
                      name='server_group'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.serverGroup')}</FormLabel>
                          <FormControl>
                            <Accordion type='single' collapsible className='w-full'>
                              {server_groups?.map((group: API.ServerGroup) => {
                                const value = field.value || [];

                                return (
                                  <AccordionItem key={group.id} value={String(group.id)}>
                                    <AccordionTrigger>
                                      <div className='flex items-center gap-2'>
                                        <Checkbox
                                          checked={value.includes(group.id!)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? form.setValue(field.name, [...value, group.id])
                                              : form.setValue(
                                                  field.name,
                                                  value.filter(
                                                    (value: number) => value !== group.id,
                                                  ),
                                                );
                                          }}
                                        />
                                        <Label>{group.name}</Label>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <ul className='list-disc [&>li]:mt-2'>
                                        {server
                                          ?.filter(
                                            (server: API.Server) => server.group_id === group.id,
                                          )
                                          ?.map((node: API.Server) => {
                                            return (
                                              <li
                                                key={node.id}
                                                className='flex items-center justify-between *:flex-1'
                                              >
                                                <span>{node.name}</span>
                                                <span>{node.server_addr}</span>
                                                <span className='text-right'>{node.protocol}</span>
                                              </li>
                                            );
                                          })}
                                      </ul>
                                    </AccordionContent>
                                  </AccordionItem>
                                );
                              })}
                            </Accordion>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='server'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('form.server')}</FormLabel>
                          <FormControl>
                            <div className='flex flex-col gap-2'>
                              {server
                                ?.filter((item: API.Server) => !item.group_id)
                                ?.map((item: API.Server) => {
                                  const value = field.value || [];

                                  return (
                                    <div className='flex items-center gap-2' key={item.id}>
                                      <Checkbox
                                        checked={value.includes(item.id!)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? form.setValue(field.name, [...value, item.id])
                                            : form.setValue(
                                                field.name,
                                                value.filter((value: number) => value !== item.id),
                                              );
                                        }}
                                      />
                                      <Label className='flex w-full items-center justify-between *:flex-1'>
                                        <span>{item.name}</span>
                                        <span>{item.server_addr}</span>
                                        <span className='text-right'>{item.protocol}</span>
                                      </Label>
                                    </div>
                                  );
                                })}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button
            variant='outline'
            disabled={loading}
            onClick={() => {
              setOpen(false);
            }}
          >
            {t('form.cancel')}
          </Button>
          <Button
            disabled={loading}
            onClick={form.handleSubmit(handleSubmit, (errors) => {
              const keys = Object.keys(errors);
              for (const key of keys) {
                const formattedKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                toast.error(`${t(`form.${formattedKey}`)} is ${errors[key]?.message}`);
                return false;
              }
            })}
          >
            {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
            {t('form.confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
