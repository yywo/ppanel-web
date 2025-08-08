'use client';

import { ProTable } from '@/components/pro-table';
import {
  getBatchSendEmailTaskList,
  getBatchSendEmailTaskStatus,
  stopBatchSendEmailTask,
} from '@/services/admin/marketing';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
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
import { useState } from 'react';
import { toast } from 'sonner';

export default function EmailTaskManager() {
  const t = useTranslations('marketing');
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<API.BatchSendEmailTask | null>(null);

  // Get task status
  const refreshTaskStatus = async (taskId: number) => {
    setRefreshing((prev) => ({ ...prev, [taskId]: true }));
    try {
      const response = await getBatchSendEmailTaskStatus({
        id: taskId,
      });

      const taskStatus = response.data?.data;
      if (taskStatus) {
        // Just show success message, ProTable will auto-refresh
        toast.success(t('taskStatusRefreshed'));
      }
    } catch (error) {
      console.error('Failed to refresh task status:', error);
      toast.error(t('failedToRefreshTaskStatus'));
    } finally {
      setRefreshing((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Stop task
  const stopTask = async (taskId: number) => {
    try {
      await stopBatchSendEmailTask({
        id: taskId,
      });

      toast.success(t('taskStoppedSuccessfully'));
      await refreshTaskStatus(taskId);
    } catch (error) {
      console.error('Failed to stop task:', error);
      toast.error(t('failedToStopTask'));
    }
  };

  const getStatusBadge = (status: number) => {
    const statusConfig = {
      0: { label: t('notStarted'), variant: 'secondary' as const },
      1: { label: t('inProgress'), variant: 'default' as const },
      2: { label: t('completed'), variant: 'default' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: `${t('status')} ${status}`,
      variant: 'secondary' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className='flex cursor-pointer items-center justify-between transition-colors'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <Icon icon='mdi:email-multiple' className='text-primary h-5 w-5' />
            </div>
            <div className='flex-1'>
              <p className='font-medium'>{t('emailTaskManager')}</p>
              <p className='text-muted-foreground text-sm'>
                {t('viewAndManageEmailBroadcastTasks')}
              </p>
            </div>
          </div>
          <Icon icon='mdi:chevron-right' className='size-6' />
        </div>
      </SheetTrigger>
      <SheetContent className='w-[1000px] max-w-full md:max-w-screen-lg'>
        <SheetHeader>
          <SheetTitle>{t('emailBroadcastTasks')}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-env(safe-area-inset-top))] px-6'>
          <div className='mt-4 space-y-4'>
            <ProTable<API.BatchSendEmailTask, API.GetBatchSendEmailTaskListParams>
              columns={[
                {
                  accessorKey: 'subject',
                  header: t('subject'),
                  size: 200,
                  cell: ({ row }) => (
                    <div
                      className='max-w-[200px] truncate font-medium'
                      title={row.getValue('subject') as string}
                    >
                      {row.getValue('subject') as string}
                    </div>
                  ),
                },
                {
                  accessorKey: 'scope',
                  header: t('recipientType'),
                  size: 120,
                  cell: ({ row }) => {
                    const scope = row.getValue('scope') as string;
                    const scopeLabels = {
                      all: t('allUsers'),
                      active: t('subscribedUsers'),
                      expired: t('expiredUsers'),
                      none: t('nonSubscribers'),
                      skip: t('specificUsers'),
                    };
                    return scopeLabels[scope as keyof typeof scopeLabels] || scope;
                  },
                },
                {
                  accessorKey: 'status',
                  header: t('status'),
                  size: 100,
                  cell: ({ row }) => getStatusBadge(row.getValue('status') as number),
                },
                {
                  accessorKey: 'progress',
                  header: t('progress'),
                  size: 150,
                  cell: ({ row }) => {
                    const task = row.original as API.BatchSendEmailTask;
                    const progress = task.total > 0 ? (task.current / task.total) * 100 : 0;
                    return (
                      <div className='space-y-1'>
                        <div className='flex justify-between text-sm'>
                          <span>
                            {task.current} / {task.total}
                          </span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className='bg-muted h-2 overflow-hidden rounded-full'>
                          <div
                            className='bg-primary h-full transition-all duration-300'
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                },
                {
                  accessorKey: 'created_at',
                  header: t('createdAt'),
                  size: 150,
                  cell: ({ row }) => {
                    const createdAt = row.getValue('created_at') as number;
                    return formatDate(createdAt);
                  },
                },
                {
                  accessorKey: 'scheduled',
                  header: t('sendTime'),
                  size: 150,
                  cell: ({ row }) => {
                    const scheduled = row.getValue('scheduled') as number;
                    return scheduled && scheduled > 0 ? formatDate(scheduled) : '--';
                  },
                },
              ]}
              request={async (pagination, filters) => {
                const response = await getBatchSendEmailTaskList({
                  ...filters,
                  page: pagination.page,
                  size: pagination.size,
                });
                return {
                  list: response.data?.data?.list || [],
                  total: response.data?.data?.total || 0,
                };
              }}
              params={[
                {
                  key: 'status',
                  placeholder: t('status'),
                  options: [
                    { label: t('notStarted'), value: '0' },
                    { label: t('inProgress'), value: '1' },
                    { label: t('completed'), value: '2' },
                  ],
                },
                {
                  key: 'scope',
                  placeholder: t('sendScope'),
                  options: [
                    { label: t('allUsers'), value: 'all' },
                    { label: t('subscribedUsers'), value: 'active' },
                    { label: t('expiredUsers'), value: 'expired' },
                    { label: t('nonSubscribers'), value: 'none' },
                    { label: t('specificUsers'), value: 'skip' },
                  ],
                },
              ]}
              actions={{
                render: (row) => {
                  return [
                    <Dialog key='view-content'>
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => setSelectedTask(row as API.BatchSendEmailTask)}
                        >
                          <Icon icon='mdi:eye' />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-h-[80vh] max-w-4xl'>
                        <DialogHeader>
                          <DialogTitle>{t('emailContent')}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className='h-[60vh] pr-4'>
                          {selectedTask && (
                            <div className='space-y-4'>
                              <div>
                                <h4 className='text-muted-foreground mb-2 text-sm font-medium'>
                                  {t('subject')}
                                </h4>
                                <p className='font-medium'>{selectedTask.subject}</p>
                              </div>
                              <div>
                                <h4 className='text-muted-foreground mb-2 text-sm font-medium'>
                                  {t('content')}
                                </h4>
                                <div
                                  className='prose prose-sm max-w-none'
                                  dangerouslySetInnerHTML={{ __html: selectedTask.content }}
                                />
                              </div>
                              {selectedTask.additional && (
                                <div>
                                  <h4 className='text-muted-foreground mb-2 text-sm font-medium'>
                                    {t('additionalRecipients')}
                                  </h4>
                                  <p className='text-sm'>{selectedTask.additional}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>,
                    <Button
                      key='refresh'
                      variant='outline'
                      size='icon'
                      onClick={() => refreshTaskStatus(row.id)}
                      disabled={refreshing[row.id]}
                    >
                      {refreshing[row.id] && (
                        <Icon icon='mdi:loading' className='mr-2 h-3 w-3 animate-spin' />
                      )}
                      <Icon icon='mdi:refresh' className='h-3 w-3' />
                    </Button>,
                    ...([0, 1].includes(row.status)
                      ? [
                          <Button key='stop' variant='destructive' onClick={() => stopTask(row.id)}>
                            {t('stop')}
                          </Button>,
                        ]
                      : []),
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
