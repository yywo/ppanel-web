'use client';

import {
  getNodeConfig,
  getNodeMultiplier,
  setNodeMultiplier,
  updateNodeConfig,
} from '@/services/admin/system';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { DicesIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

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

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start_time: '', end_time: '', multiplier: 1 }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof API.TimePeriod, value: string | number) => {
    const updatedSlots = timeSlots.map((slot, i) => {
      if (i === index) {
        return { ...slot, [field]: value };
      }
      return slot;
    });
    setTimeSlots(updatedSlots);
  };

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
      <div className='px-2'>
        <div className='mt-4 grid gap-4'>
          {timeSlots.map((slot, index) => (
            <div key={index} className='flex flex-col items-end gap-2 lg:flex-row'>
              <div>
                <Label>{t('startTime')}</Label>
                <EnhancedInput
                  key={`${index}-start-time`}
                  type='time'
                  value={slot.start_time}
                  onValueChange={(value) => updateTimeSlot(index, 'start_time', value as string)}
                />
              </div>

              <div>
                <Label>{t('endTime')}</Label>
                <EnhancedInput
                  key={`${index}-end-time`}
                  type='time'
                  value={slot.end_time}
                  onValueChange={(value) => updateTimeSlot(index, 'end_time', value as string)}
                />
              </div>

              <div>
                <Label>{t('multiplier')}</Label>
                <EnhancedInput
                  key={`${index}-multiplier`}
                  type='number'
                  value={slot.multiplier}
                  onValueChange={(value) => updateTimeSlot(index, 'multiplier', value as number)}
                  min={1}
                  step='0.1'
                />
              </div>
              <Button
                variant='destructive'
                onClick={() => {
                  removeTimeSlot(index);
                }}
              >
                {t('delete')}
              </Button>
            </div>
          ))}
        </div>
        <Button onClick={addTimeSlot} variant='outline' className='mt-4 w-full'>
          {t('addTimeSlot')}
        </Button>
      </div>
    </>
  );
}
