'use client';

import { Display } from '@/components/display';
import { ProTable, ProTableActions } from '@/components/pro-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useRef, useState } from 'react';
import { SubscriptionDetail } from './subscription-detail';
import { SubscriptionForm } from './subscription-form';

// 模拟数据
const mockData: API.Subscribe[] = [
  {
    id: 1,
    name: 'Basic Package',
    description: 'Basic Traffic Package',
    unit_price: 9.9,
    unit_time: '30d',
    discount: [],
    replacement: 0,
    inventory: 100,
    traffic: 1073741824, // 1GB
    speed_limit: 10,
    device_limit: 3,
    quota: 0,
    group_id: 1,
    server_group: [1],
    server: [1, 2],
    show: true,
    sell: true,
    sort: 1,
    deduction_ratio: 0,
    allow_deduction: false,
    reset_cycle: 30,
    renewal_reset: true,
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  // 可以添加更多模拟数据...
];

interface Props {
  userId: string;
}

export default function UserSubscription({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.Subscribe, Record<string, unknown>>
      action={ref}
      header={{
        title: 'Subscription List',
        toolbar: (
          <SubscriptionForm
            key='create'
            trigger={<Button>Create</Button>}
            title='Create Subscription'
            loading={loading}
            userId={userId}
            onSubmit={async (values) => {
              console.log('创建订阅:', values);
              return true;
            }}
          />
        ),
      }}
      columns={[
        {
          accessorKey: 'id',
          header: 'ID',
        },
        {
          accessorKey: 'name',
          header: '名称',
        },
        {
          accessorKey: 'traffic',
          header: '流量',
          cell: ({ row }) => <Display type='traffic' value={row.getValue('traffic')} />,
        },
        {
          accessorKey: 'speed_limit',
          header: '限速',
          cell: ({ row }) => `${row.getValue('speed_limit')} Mbps`,
        },
        {
          accessorKey: 'device_limit',
          header: '设备限制',
        },
        {
          accessorKey: 'created_at',
          header: '创建时间',
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      request={async () => {
        // 模拟异步请求
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          list: mockData,
          total: mockData.length,
        };
      }}
      actions={{
        render: (row) => {
          return [
            <SubscriptionForm
              key='edit'
              trigger={<Button>Edit</Button>}
              title='Edit Subscription'
              loading={loading}
              userId={userId}
              initialData={row}
              onSubmit={async (values) => {
                console.log('编辑订阅:', values);
                return true;
              }}
            />,
            <SubscriptionDetail
              key='detail'
              trigger={<Button variant='secondary'>Details</Button>}
              subscriptionId={row.id.toString()}
            />,
            <ConfirmButton
              key='delete'
              trigger={<Button variant='destructive'>Delete</Button>}
              title='Confirm Delete'
              description='Are you sure to delete this subscription?'
              onConfirm={async () => {
                console.log('删除订阅:', row.id);
              }}
              cancelText='Cancel'
              confirmText='Confirm'
            />,
          ];
        },
      }}
    />
  );
}
