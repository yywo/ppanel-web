'use client';

import { Display } from '@/components/display';
import { ProTable } from '@/components/pro-table';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

// 模拟数据
const mockLogs = [
  { id: 1, action: 'Create Subscription', created_at: Date.now() - 86400000 },
  { id: 2, action: 'Update Traffic', created_at: Date.now() - 3600000 },
];

const mockTrafficLogs = [
  { id: 1, traffic: 104857600, created_at: Date.now() - 86400000 },
  { id: 2, traffic: 52428800, created_at: Date.now() - 3600000 },
];

const mockDevices = [
  { id: 1, ip: '192.168.1.1', last_seen_at: Date.now() - 300000 },
  { id: 2, ip: '192.168.1.2', last_seen_at: Date.now() - 600000 },
];

interface Props {
  trigger: ReactNode;
  subscriptionId: string;
}

export function SubscriptionDetail({ trigger }: Props) {
  const [open, setOpen] = useState(false);

  // 模拟下线设备的函数
  const handleOfflineDevice = async (deviceId: number) => {
    // TODO: 调用实际的API
    console.log('下线设备:', deviceId);
    toast.success('设备已下线');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          <Tabs defaultValue='logs'>
            <TabsList className='w-full'>
              <TabsTrigger value='logs' className='flex-1'>
                Subscription Logs
              </TabsTrigger>
              <TabsTrigger value='traffic' className='flex-1'>
                Traffic Logs
              </TabsTrigger>
              <TabsTrigger value='devices' className='flex-1'>
                Online Devices
              </TabsTrigger>
            </TabsList>
            <TabsContent value='logs'>
              <ProTable
                columns={[
                  {
                    accessorKey: 'action',
                    header: 'Action',
                  },
                  {
                    accessorKey: 'created_at',
                    header: 'Time',
                    cell: ({ row }) => formatDate(row.getValue('created_at')),
                  },
                ]}
                request={async () => ({
                  list: mockLogs,
                  total: mockLogs.length,
                })}
              />
            </TabsContent>
            <TabsContent value='traffic'>
              <ProTable
                columns={[
                  {
                    accessorKey: 'traffic',
                    header: 'Traffic',
                    cell: ({ row }) => <Display type='traffic' value={row.getValue('traffic')} />,
                  },
                  {
                    accessorKey: 'created_at',
                    header: 'Time',
                    cell: ({ row }) => formatDate(row.getValue('created_at')),
                  },
                ]}
                request={async () => ({
                  list: mockTrafficLogs,
                  total: mockTrafficLogs.length,
                })}
              />
            </TabsContent>
            <TabsContent value='devices'>
              <ProTable
                columns={[
                  {
                    accessorKey: 'ip',
                    header: 'IP',
                  },
                  {
                    accessorKey: 'last_seen_at',
                    header: 'Last Seen',
                    cell: ({ row }) => formatDate(row.getValue('last_seen_at')),
                  },
                ]}
                request={async () => ({
                  list: mockDevices,
                  total: mockDevices.length,
                })}
                actions={{
                  render: (row) => {
                    return [
                      <ConfirmButton
                        key='offline'
                        trigger={
                          <Button variant='destructive' size='sm'>
                            下线
                          </Button>
                        }
                        title='Confirm Offline'
                        description={`Are you sure to offline IP ${row.ip}?`}
                        onConfirm={() => handleOfflineDevice(row.id)}
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
