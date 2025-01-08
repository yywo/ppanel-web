'use client';

import { Display } from '@/components/display';
import { ProTable, ProTableActions } from '@/components/pro-table';
import { createUser, deleteUser, getUserList, updateUser } from '@/services/admin/user';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UserDetail } from './user-detail';
import UserForm from './user-form';

export default function Page() {
  const t = useTranslations('user');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.User, Record<string, unknown>>
      action={ref}
      header={{
        title: t('userList'),
        toolbar: (
          <UserForm<API.CreateUserRequest>
            key='create'
            trigger={t('create')}
            title={t('createUser')}
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await createUser(values);
                toast.success(t('createSuccess'));
                ref.current?.refresh();
                setLoading(false);

                return true;
              } catch (error) {
                setLoading(false);

                return false;
              }
            }}
          />
        ),
      }}
      columns={[
        {
          accessorKey: 'enable',
          header: t('enable'),
          cell: ({ row }) => {
            return (
              <Switch
                defaultChecked={row.getValue('enable')}
                onCheckedChange={async (checked) => {
                  await updateUser({
                    ...row.original,
                    enable: checked,
                  } as unknown as API.UpdateUserRequest);
                  toast.success(t('updateSuccess'));
                  ref.current?.refresh();
                }}
              />
            );
          },
        },
        {
          accessorKey: 'id',
          header: 'ID',
        },
        {
          accessorKey: 'email',
          header: t('userName'),
        },
        {
          accessorKey: 'balance',
          header: t('balance'),
          cell: ({ row }) => <Display type='currency' value={row.getValue('balance')} />,
        },
        {
          accessorKey: 'gift_amount',
          header: t('giftAmount'),
          cell: ({ row }) => <Display type='currency' value={row.getValue('gift_amount')} />,
        },
        {
          accessorKey: 'commission',
          header: t('commission'),
          cell: ({ row }) => <Display type='currency' value={row.getValue('commission')} />,
        },
        {
          accessorKey: 'refer_code',
          header: t('inviteCode'),
          cell: ({ row }) => row.getValue('refer_code') || '--',
        },
        {
          accessorKey: 'referer_id',
          header: t('referer'),
          cell: ({ row }) => <UserDetail id={row.original.referer_id} />,
        },
        {
          accessorKey: 'created_at',
          header: t('createdAt'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      request={async (pagination) => {
        const { data } = await getUserList(pagination);
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
      actions={{
        render: (row) => {
          return [
            <UserForm<API.UpdateUserRequest>
              key='edit'
              trigger={t('edit')}
              title={t('editUser')}
              loading={loading}
              initialValues={row as unknown as API.UpdateUserRequest}
              onSubmit={async (values) => {
                setLoading(true);
                try {
                  await updateUser({
                    ...row,
                    ...values,
                  });
                  toast.success(t('updateSuccess'));
                  ref.current?.refresh();
                  setLoading(false);

                  return true;
                } catch (error) {
                  setLoading(false);

                  return false;
                }
              }}
            />,
            <ConfirmButton
              key='edit'
              trigger={<Button variant='destructive'>{t('delete')}</Button>}
              title={t('confirmDelete')}
              description={t('deleteDescription')}
              onConfirm={async () => {
                await deleteUser({ id: row.id });
                toast.success(t('deleteSuccess'));
                ref.current?.refresh();
              }}
              cancelText={t('cancel')}
              confirmText={t('confirm')}
            />,
          ];
        },
      }}
    />
  );
}
