'use client';

import { Display } from '@/components/display';
import { ProTable } from '@/components/pro-table';
import {
  getUserSubscribeDevices,
  getUserSubscribeLogs,
  getUserSubscribeTrafficLogs,
  kickOfflineByUserDevice,
} from '@/services/admin/user';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Switch } from '@workspace/ui/components/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionDetail({
  trigger,
  userId,
  subscriptionId,
}: {
  trigger: ReactNode;
  userId: number;
  subscriptionId: number;
}) {
  const t = useTranslations('user');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle>{t('subscriptionDetails')}</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <Tabs defaultValue='logs'>
            <TabsList className='w-full'>
              <TabsTrigger value='logs' className='flex-1'>
                {t('subscriptionLogs')}
              </TabsTrigger>
              <TabsTrigger value='traffic' className='flex-1'>
                {t('trafficLogs')}
              </TabsTrigger>
              <TabsTrigger value='devices' className='flex-1'>
                {t('onlineDevices')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value='logs'>
              <ProTable<API.UserSubscribeLog, Record<string, unknown>>
                columns={[
                  {
                    accessorKey: 'ip',
                    header: 'IP',
                  },
                  {
                    accessorKey: 'user_agent',
                    header: 'User Agent',
                  },
                  {
                    accessorKey: 'token',
                    header: 'Token',
                  },
                  {
                    accessorKey: 'created_at',
                    header: 'Time',
                    cell: ({ row }) => formatDate(row.getValue('created_at')),
                  },
                ]}
                request={async (pagination) => {
                  const { data } = await getUserSubscribeLogs({
                    user_id: userId,
                    subscribe_id: subscriptionId,
                    ...pagination,
                  });
                  return {
                    list: data.data?.list || [],
                    total: data.data?.total || 0,
                  };
                }}
              />
            </TabsContent>
            <TabsContent value='traffic'>
              <ProTable<API.TrafficLog, Record<string, unknown>>
                columns={[
                  {
                    accessorKey: 'download',
                    header: 'Download',
                    cell: ({ row }) => <Display type='traffic' value={row.getValue('download')} />,
                  },
                  {
                    accessorKey: 'upload',
                    header: 'Upload',
                    cell: ({ row }) => <Display type='traffic' value={row.getValue('upload')} />,
                  },
                  {
                    accessorKey: 'timestamp',
                    header: 'Time',
                    cell: ({ row }) => formatDate(row.getValue('timestamp')),
                  },
                ]}
                request={async (pagination) => {
                  const { data } = await getUserSubscribeTrafficLogs({
                    user_id: userId,
                    subscribe_id: subscriptionId,
                    ...pagination,
                  });
                  return {
                    list: data.data?.list || [],
                    total: data.data?.total || 0,
                  };
                }}
              />
            </TabsContent>
            <TabsContent value='devices'>
              <ProTable<API.UserDevice, Record<string, unknown>>
                columns={[
                  {
                    accessorKey: 'enabled',
                    header: 'Enabled',
                    cell: ({ row }) => (
                      <Switch
                        checked={row.getValue('enabled')}
                        onChange={(checked) => {
                          console.log('Switch:', checked);
                        }}
                      />
                    ),
                  },
                  {
                    accessorKey: 'id',
                    header: 'ID',
                  },
                  {
                    accessorKey: 'imei',
                    header: 'IMEI',
                  },
                  {
                    accessorKey: 'user_agent',
                    header: 'User Agent',
                  },
                  {
                    accessorKey: 'ip',
                    header: 'IP',
                  },
                  {
                    accessorKey: 'online',
                    header: 'Online',
                    cell: ({ row }) => (
                      <Badge variant={row.getValue('online') ? 'default' : 'destructive'}>
                        {row.getValue('online') ? 'Online' : 'Offline'}
                      </Badge>
                    ),
                  },
                  {
                    accessorKey: 'updated_at',
                    header: 'Last Seen',
                    cell: ({ row }) => formatDate(row.getValue('updated_at')),
                  },
                ]}
                request={async (pagination) => {
                  const { data } = await getUserSubscribeDevices({
                    user_id: userId,
                    subscribe_id: subscriptionId,
                    ...pagination,
                  });
                  return {
                    list: data.data?.list || [],
                    total: data.data?.total || 0,
                  };
                }}
                actions={{
                  render: (row) => {
                    if (!row.imei) return [];
                    return [
                      <ConfirmButton
                        key='offline'
                        trigger={<Button variant='destructive'>{t('confirmOffline')}</Button>}
                        title={t('confirmOffline')}
                        description={`Are you sure to offline IP ${row.ip}?`}
                        onConfirm={async () => {
                          await kickOfflineByUserDevice({ id: row.id });
                          toast.success('已通知下线');
                        }}
                        cancelText='Cancel'
                        confirmText='Confirm'
                      />,
                    ];
                  },
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
