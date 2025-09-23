'use client';

import {
  getNodeConfig,
  getNodeMultiplier,
  setNodeMultiplier,
  updateNodeConfig,
} from '@/services/admin/system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';

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
import { ArrayInput } from '@workspace/ui/custom-components/dynamic-Inputs';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { DicesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { uid } from 'radash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const nodeConfigSchema = z.object({
  node_secret: z.string().optional(),
  node_pull_interval: z.number().optional(),
  node_push_interval: z.number().optional(),
});
type NodeConfigFormData = z.infer<typeof nodeConfigSchema>;

export default function ServerConfig() {
  const t = useTranslations('servers');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timeSlots, setTimeSlots] = useState<API.TimePeriod[]>([]);

  const { data: cfgResp, refetch: refetchCfg } = useQuery({
    queryKey: ['getNodeConfig'],
    queryFn: async () => {
      const { data } = await getNodeConfig();
      return data.data as API.NodeConfig | undefined;
    },
    enabled: open,
  });

  const { data: periodsResp, refetch: refetchPeriods } = useQuery({
    queryKey: ['getNodeMultiplier'],
    queryFn: async () => {
      const { data } = await getNodeMultiplier();
      return (data.data?.periods || []) as API.TimePeriod[];
    },
    enabled: open,
  });

  const form = useForm<NodeConfigFormData>({
    resolver: zodResolver(nodeConfigSchema),
    defaultValues: {
      node_secret: '',
      node_pull_interval: undefined,
      node_push_interval: undefined,
    },
  });

  useEffect(() => {
    if (cfgResp) {
      form.reset({
        node_secret: cfgResp.node_secret ?? '',
        node_pull_interval: cfgResp.node_pull_interval as number | undefined,
        node_push_interval: cfgResp.node_push_interval as number | undefined,
      });
    }
  }, [cfgResp, form]);

  useEffect(() => {
    if (periodsResp) {
      setTimeSlots(periodsResp);
    }
  }, [periodsResp]);

  async function onSubmit(values: NodeConfigFormData) {
    setSaving(true);
    try {
      await updateNodeConfig(values as API.NodeConfig);
      toast.success(t('config.saveSuccess'));
      await refetchCfg();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function savePeriods() {
    await setNodeMultiplier({ periods: timeSlots });
    await refetchPeriods();
    toast.success(t('config.saveSuccess'));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className='flex cursor-pointer items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <Icon icon='mdi:resistor-nodes' className='text-primary h-5 w-5' />
            </div>
            <div className='flex-1'>
              <p className='font-medium'>{t('config.title')}</p>
              <p className='text-muted-foreground text-sm'>{t('config.description')}</p>
            </div>
          </div>
          <Icon icon='mdi:chevron-right' className='size-6' />
        </div>
      </SheetTrigger>

      <SheetContent className='w-[720px] max-w-full md:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>{t('config.title')}</SheetTitle>
        </SheetHeader>

        <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-6'>
          <Form {...form}>
            <form
              id='server-config-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 pt-4'
            >
              <FormField
                control={form.control}
                name='node_secret'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('config.communicationKey')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        placeholder={t('config.inputPlaceholder')}
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        suffix={
                          <div className='bg-muted flex h-9 items-center px-3'>
                            <DicesIcon
                              onClick={() => {
                                const id = uid(32).toLowerCase();
                                const formatted = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
                                form.setValue('node_secret', formatted);
                              }}
                              className='cursor-pointer'
                            />
                          </div>
                        }
                      />
                    </FormControl>
                    <FormDescription>{t('config.communicationKeyDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='node_pull_interval'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('config.nodePullInterval')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        type='number'
                        min={0}
                        suffix='S'
                        value={field.value as any}
                        onValueChange={field.onChange}
                        placeholder={t('config.inputPlaceholder')}
                      />
                    </FormControl>
                    <FormDescription>{t('config.nodePullIntervalDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='node_push_interval'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('config.nodePushInterval')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        type='number'
                        min={0}
                        suffix='S'
                        step={0.1}
                        value={field.value as any}
                        onValueChange={field.onChange}
                        placeholder={t('config.inputPlaceholder')}
                      />
                    </FormControl>
                    <FormDescription>{t('config.nodePushIntervalDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='mt-6 space-y-3'>
                <Label className='text-base'>{t('config.dynamicMultiplier')}</Label>
                <p className='text-muted-foreground text-sm'>
                  {t('config.dynamicMultiplierDescription')}
                </p>

                <div className='flex flex-col gap-2'>
                  <div className='w-full'>
                    <ArrayInput<API.TimePeriod>
                      fields={[
                        { name: 'start_time', prefix: t('config.startTime'), type: 'time' },
                        { name: 'end_time', prefix: t('config.endTime'), type: 'time' },
                        {
                          name: 'multiplier',
                          prefix: t('config.multiplier'),
                          type: 'number',
                          placeholder: '0',
                        },
                      ]}
                      value={timeSlots}
                      onChange={setTimeSlots}
                    />
                    <div className='mt-3 flex gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={() => setTimeSlots(periodsResp || [])}
                      >
                        {t('config.reset')}
                      </Button>
                      <Button size='sm' type='button' onClick={savePeriods}>
                        {t('config.save')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' disabled={saving} onClick={() => setOpen(false)}>
            {t('config.actions.cancel')}
          </Button>
          <Button disabled={saving} type='submit' form='server-config-form'>
            <Icon icon='mdi:loading' className={saving ? 'mr-2 animate-spin' : 'hidden'} />
            {t('config.actions.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
