'use client';

import {
  getNodeConfig,
  getNodeMultiplier,
  setNodeMultiplier,
  updateNodeConfig,
} from '@/services/admin/system';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { ChartContainer, ChartTooltip } from '@workspace/ui/components/chart';
import { Label } from '@workspace/ui/components/label';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { ArrayInput } from '@workspace/ui/custom-components/dynamic-Inputs';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { DicesIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart } from 'recharts';
import { toast } from 'sonner';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function Node() {
  const t = useTranslations('system.node');

  const { data, refetch } = useQuery({
    queryKey: ['getNodeConfig'],
    queryFn: async () => {
      const { data } = await getNodeConfig();

      return data.data;
    },
  });

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateNodeConfig({
        ...data,
        [key]: value,
      } as API.NodeConfig);
      toast.success(t('saveSuccess'));
      refetch();
    } catch (error) {
      /* empty */
    }
  }

  const [timeSlots, setTimeSlots] = useState<API.TimePeriod[]>([]);

  const { data: NodeMultiplier, refetch: refetchNodeMultiplier } = useQuery({
    queryKey: ['getNodeMultiplier'],
    queryFn: async () => {
      const { data } = await getNodeMultiplier();
      if (timeSlots.length === 0) {
        setTimeSlots(data.data?.periods || []);
      }
      return data.data?.periods || [];
    },
  });

  const chartTimeSlots = useMemo(() => {
    return timeSlots.map((slot) => ({
      name: `${slot.start_time} - ${slot.end_time}`,
      value: slot.multiplier,
    }));
  }, [timeSlots]);

  const chartConfig = useMemo(() => {
    return chartTimeSlots.reduce(
      (acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: COLORS[index % COLORS.length] || 'hsl(var(--default-chart-color))',
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    );
  }, [data]);

  return (
    <>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Label>{t('communicationKey')}</Label>
              <p className='text-muted-foreground text-xs'>{t('communicationKeyDescription')}</p>
            </TableCell>
            <TableCell className='text-right'>
              <EnhancedInput
                placeholder={t('inputPlaceholder')}
                value={data?.node_secret}
                onValueBlur={(value) => updateConfig('node_secret', value)}
                suffix={
                  <DicesIcon
                    onClick={() => {
                      updateConfig('node_secret', nanoid());
                    }}
                  />
                }
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Label>{t('nodePullInterval')}</Label>
              <p className='text-muted-foreground text-xs'>{t('nodePullIntervalDescription')}</p>
            </TableCell>
            <TableCell className='text-right'>
              <EnhancedInput
                type='number'
                min={0}
                onValueBlur={(value) => updateConfig('node_pull_interval', value)}
                suffix='S'
                value={data?.node_pull_interval}
                placeholder={t('inputPlaceholder')}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Label>{t('nodePushInterval')}</Label>
              <p className='text-muted-foreground text-xs'>{t('nodePushIntervalDescription')}</p>
            </TableCell>
            <TableCell className='text-right'>
              <EnhancedInput
                type='number'
                min={0}
                value={data?.node_push_interval}
                onValueBlur={(value) => updateConfig('node_push_interval', value)}
                placeholder={t('inputPlaceholder')}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Label>{t('dynamicMultiplier')}</Label>
              <p className='text-muted-foreground text-xs'>{t('dynamicMultiplierDescription')}</p>
            </TableCell>
            <TableCell className='flex justify-end gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setTimeSlots(NodeMultiplier || []);
                }}
              >
                {t('reset')}
              </Button>
              <Button
                size='sm'
                onClick={() => {
                  setNodeMultiplier({
                    periods: timeSlots,
                  }).then(async () => {
                    const result = await refetchNodeMultiplier();
                    if (result.data) setTimeSlots(result.data);
                    toast.success(t('saveSuccess'));
                  });
                }}
              >
                {t('save')}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className='flex flex-col-reverse gap-8 px-4 pt-6 md:flex-row md:items-start'>
        <div className='w-full md:w-1/2'>
          <ChartContainer config={chartConfig} className='mx-auto aspect-square max-w-[400px]'>
            <PieChart>
              <Pie
                data={chartTimeSlots}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius='80%'
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent, value }) =>
                  `${value?.toFixed(2)}x (${(percent * 100).toFixed(0)}%)`
                }
              >
                {chartTimeSlots.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0]?.payload;
                    return (
                      <div className='bg-background rounded-lg border p-2 shadow-sm'>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='flex flex-col'>
                            <span className='text-muted-foreground text-[0.70rem] uppercase'>
                              {t('timeSlot')}
                            </span>
                            <span className='text-muted-foreground font-bold'>
                              {data.name || '其他'}
                            </span>
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-muted-foreground text-[0.70rem] uppercase'>
                              {t('multiplier')}
                            </span>
                            <span className='font-bold'>{data.value.toFixed(2)}x</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ChartContainer>
        </div>
        <div className='w-full md:w-1/2'>
          <ArrayInput<API.TimePeriod>
            fields={[
              {
                name: 'start_time',
                prefix: t('startTime'),
                type: 'time',
              },
              { name: 'end_time', prefix: t('endTime'), type: 'time' },
              { name: 'multiplier', prefix: t('multiplier'), type: 'number' },
            ]}
            value={timeSlots}
            onChange={setTimeSlots}
          />
        </div>
      </div>
    </>
  );
}
