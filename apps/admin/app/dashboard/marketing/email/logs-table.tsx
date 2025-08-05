'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Icon } from '@workspace/ui/custom-components/icon';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

interface EmailLog extends Record<string, unknown> {
  id: number;
  subject: string;
  recipient_email: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
  broadcast_id: number;
}

interface GetEmailLogsParams extends Record<string, unknown> {
  page: number;
  size: number;
  status?: string;
  search?: string;
}

// Mock API function
const getEmailLogs = async (params: GetEmailLogsParams) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data
  const mockData: EmailLog[] = [
    {
      id: 1,
      subject: 'New Feature Release Notification',
      recipient_email: 'user1@example.com',
      status: 'sent',
      sent_at: '2024-01-15T10:05:00Z',
      broadcast_id: 1,
    },
    {
      id: 2,
      subject: 'New Feature Release Notification',
      recipient_email: 'user2@example.com',
      status: 'sent',
      sent_at: '2024-01-15T10:05:30Z',
      broadcast_id: 1,
    },
    {
      id: 3,
      subject: 'New Feature Release Notification',
      recipient_email: 'user3@example.com',
      status: 'failed',
      error_message: 'Invalid email address',
      broadcast_id: 1,
    },
    {
      id: 4,
      subject: 'System Maintenance Notice',
      recipient_email: 'user4@example.com',
      status: 'sent',
      sent_at: '2024-01-14T15:35:00Z',
      broadcast_id: 2,
    },
    {
      id: 5,
      subject: 'System Maintenance Notice',
      recipient_email: 'user5@example.com',
      status: 'pending',
      broadcast_id: 2,
    },
  ];

  return {
    data: {
      data: {
        list: mockData,
        total: mockData.length,
      },
    },
  };
};

export default function BroadcastLogsTable() {
  const t = useTranslations('marketing');
  const [open, setOpen] = useState(false);
  const ref = useRef<ProTableActions>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      sent: { variant: 'default' as const, label: 'Sent' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className='flex cursor-pointer items-center justify-between transition-colors'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <Icon icon='mdi:email-newsletter' className='text-primary h-5 w-5' />
            </div>
            <div className='flex-1'>
              <p className='font-medium'>Broadcast Logs</p>
              <p className='text-muted-foreground text-sm'>
                View email send records and detailed status
              </p>
            </div>
          </div>
          <Icon icon='mdi:chevron-right' className='size-6' />
        </div>
      </SheetTrigger>
      <SheetContent className='w-[90vw] max-w-full md:max-w-screen-xl'>
        <SheetHeader>
          <SheetTitle>Broadcast Logs</SheetTitle>
        </SheetHeader>
        <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-env(safe-area-inset-top))] px-6'>
          <div className='pt-4'>
            <ProTable<EmailLog, GetEmailLogsParams>
              action={ref}
              columns={[
                {
                  accessorKey: 'id',
                  header: 'ID',
                  size: 80,
                },
                {
                  accessorKey: 'subject',
                  header: 'Subject',
                  size: 200,
                  cell: ({ row }) => (
                    <div
                      className='max-w-[200px] truncate'
                      title={row.getValue('subject') as string}
                    >
                      {row.getValue('subject') as string}
                    </div>
                  ),
                },
                {
                  accessorKey: 'recipient_email',
                  header: 'Recipient Email',
                  size: 200,
                },
                {
                  accessorKey: 'status',
                  header: 'Status',
                  size: 100,
                  cell: ({ row }) => getStatusBadge(row.getValue('status') as string),
                },
                {
                  accessorKey: 'sent_at',
                  header: 'Sent At',
                  size: 150,
                  cell: ({ row }) => {
                    const sentAt = row.getValue('sent_at') as string;
                    return sentAt ? formatDate(new Date(sentAt)) : '--';
                  },
                },
                {
                  accessorKey: 'error_message',
                  header: 'Error Message',
                  size: 200,
                  cell: ({ row }) => {
                    const error = row.getValue('error_message') as string;
                    return error ? <span className='text-sm text-red-600'>{error}</span> : '--';
                  },
                },
              ]}
              request={async (pagination, filter) => {
                const { data } = await getEmailLogs({
                  ...pagination,
                  ...filter,
                });
                return {
                  list: data.data?.list || [],
                  total: data.data?.total || 0,
                };
              }}
              params={[
                {
                  key: 'status',
                  placeholder: 'Status',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Sent', value: 'sent' },
                    { label: 'Failed', value: 'failed' },
                  ],
                },
                {
                  key: 'search',
                  placeholder: 'Recipient Email',
                },
              ]}
              actions={{
                render: (row) => {
                  return [
                    <Button key='view' variant='outline' size='sm'>
                      View
                    </Button>,
                  ];
                },
              }}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
