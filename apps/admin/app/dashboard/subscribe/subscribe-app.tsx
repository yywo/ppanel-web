'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  createApplication,
  deleteApplication,
  getApplication,
  getSubscribeType,
  updateApplication,
} from '@/services/admin/system';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import { assign, shake } from 'radash';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const defaultValues = {
  platform: 'windows',
  subscribe_type: 'Clash',
  name: '',
  icon: '',
  url: '',
};

interface FormProps<T> {
  trigger: React.ReactNode | string;
  title: string;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<boolean>;
  loading?: boolean;
}

function SubscribeAppForm<T extends API.CreateApplicationRequest | API.UpdateApplicationRequest>({
  trigger,
  title,
  loading,
  initialValues,
  onSubmit,
}: FormProps<T>) {
  const t = useTranslations('subscribe.app');
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    platform: z.enum(['windows', 'macos', 'linux', 'android', 'ios']),
    name: z.string(),
    subscribe_type: z.string(),
    icon: z.string(),
    url: z.string(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: assign(
      defaultValues,
      shake(initialValues, (value) => value === null),
    ),
  });

  useEffect(() => {
    form.reset(
      assign(
        defaultValues,
        shake(initialValues, (value) => value === null),
      ),
    );
  }, [form, initialValues]);

  const { data: subscribe_types } = useQuery<string[]>({
    queryKey: ['getSubscribeType'],
    queryFn: async () => {
      const { data } = await getSubscribeType();
      return data.data?.subscribe_types || [];
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {typeof trigger === 'string' ? <Button>{trigger}</Button> : trigger}
      </SheetTrigger>
      <SheetContent className='w-[600px] max-w-full'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='h-[calc(100dvh-48px-36px-36px)]'>
          <Form {...form}>
            <form className='space-y-4 py-4'>
              <FormField
                control={form.control}
                name='platform'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('platform')}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('platform')} />
                        </SelectTrigger>
                        <SelectContent>
                          {['windows', 'macos', 'linux', 'android', 'ios'].map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='subscribe_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subscriptionProtocol')}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('subscriptionProtocol')} />
                        </SelectTrigger>
                        <SelectContent>
                          {subscribe_types?.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appName')}</FormLabel>
                    <FormControl>
                      <EnhancedInput {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appIcon')}</FormLabel>
                    <FormControl>
                      <EnhancedInput {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appDownloadURL')}</FormLabel>
                    <FormControl>
                      <EnhancedInput {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={form.handleSubmit(async (values) => {
              const success = await onSubmit(values as T);
              if (success) setOpen(false);
            })}
            disabled={loading}
          >
            {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
            {t('confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function SubscribeApp() {
  const t = useTranslations('subscribe.app');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.Application, { platform: string }>
      action={ref}
      header={{
        toolbar: (
          <SubscribeAppForm<API.CreateApplicationRequest>
            trigger={t('add')}
            title={t('createApp')}
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await createApplication(values);
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
      params={[
        {
          key: 'platform',
          placeholder: t('platform'),
          options: [
            { label: 'Windows', value: 'windows' },
            { label: 'MacOS', value: 'mac' },
            { label: 'Linux', value: 'linux' },
            { label: 'Android', value: 'android' },
            { label: 'iOS', value: 'ios' },
          ],
        },
      ]}
      request={async (_pagination, filters) => {
        const { data } = await getApplication();
        const flatApps = Object.entries(data.data || {}).flatMap(([platform, apps]) =>
          (apps as API.Application[]).map((app) => ({
            ...app,
            platform,
          })),
        );
        return {
          list: filters.platform
            ? flatApps.filter((app) => app.platform === filters.platform)
            : flatApps,
          total: 0,
        };
      }}
      columns={[
        {
          accessorKey: 'platform',
          header: t('platform'),
          cell: ({ row }) => row.getValue('platform'),
        },
        {
          accessorKey: 'subscribe_type',
          header: t('subscriptionProtocol'),
          cell: ({ row }) => row.getValue('subscribe_type'),
        },
        {
          accessorKey: 'name',
          header: t('appName'),
        },
        {
          accessorKey: 'icon',
          header: t('appIcon'),
          cell: ({ row }) => (
            <Image
              src={row.getValue('icon')}
              alt={row.getValue('name')}
              className='h-8 w-8 rounded-md'
              width={32}
              height={32}
            />
          ),
        },
        {
          accessorKey: 'url',
          header: t('appDownloadURL'),
        },
      ]}
      actions={{
        render: (row) => [
          <SubscribeAppForm<API.UpdateApplicationRequest>
            key='edit'
            trigger={<Button>{t('edit')}</Button>}
            title={t('editApp')}
            loading={loading}
            initialValues={{
              ...row,
            }}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await updateApplication({
                  ...values,
                  id: row.id,
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
            key='delete'
            trigger={<Button variant='destructive'>{t('delete')}</Button>}
            title={t('confirmDelete')}
            description={t('deleteWarning')}
            onConfirm={async () => {
              await deleteApplication({ id: row.id! });
              toast.success(t('deleteSuccess'));
              ref.current?.refresh();
            }}
            cancelText={t('cancel')}
            confirmText={t('confirm')}
          />,
        ],
        batchRender: (rows) => [
          <ConfirmButton
            key='delete'
            trigger={<Button variant='destructive'>{t('batchDelete')}</Button>}
            title={t('confirmDelete')}
            description={t('deleteWarning')}
            onConfirm={async () => {
              await Promise.all(rows.map((row) => deleteApplication({ id: row.id! })));
              toast.success(t('deleteSuccess'));
              ref.current?.reset();
            }}
            cancelText={t('cancel')}
            confirmText={t('confirm')}
          />,
        ],
      }}
    />
  );
}
