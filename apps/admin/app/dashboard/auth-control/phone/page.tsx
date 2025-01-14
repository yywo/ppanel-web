'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import { getSmsList } from '@/services/admin/sms';
import {
  getSmsConfig,
  getSmsPlatform,
  testSmsSend,
  updateSmsConfig,
} from '@/services/admin/system';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import { AreaCodeSelect } from '@workspace/ui/custom-components/area-code-select';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const t = useTranslations('phone');
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['getSmsConfig'],
    queryFn: async () => {
      const { data } = await getSmsConfig();
      return data.data;
    },
  });

  const { data: platforms } = useQuery({
    queryKey: ['getSmsPlatform'],
    queryFn: async () => {
      const { data } = await getSmsPlatform();
      return data.data?.list;
    },
  });

  const selectedPlatform = platforms?.find((platform) => platform.platform === data?.sms_platform);
  const { platform_url, platform_field_description: platformConfig } = selectedPlatform ?? {};

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateSmsConfig({
        ...data,
        [key]: value,
      } as API.SmsConfig);
      toast.success(t('updateSuccess'));
      refetch();
    } catch (error) {
      /* empty */
    }
  }
  const [params, setParams] = useState<API.SendSmsRequest>({
    telephone: '',
    content: t('testSmsContent'),
    area_code: '1',
  });

  return (
    <Tabs defaultValue='settings' className='w-full'>
      <TabsList>
        <TabsTrigger value='settings'>{t('settings')}</TabsTrigger>
        <TabsTrigger value='logs'>{t('logs')}</TabsTrigger>
      </TabsList>

      <TabsContent value='settings'>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Label>{t('enable')}</Label>
                <p className='text-muted-foreground text-xs'>{t('enableTip')}</p>
              </TableCell>
              <TableCell className='text-right'>
                <Switch
                  checked={data?.sms_enabled}
                  onCheckedChange={(checked) => updateConfig('sms_enabled', checked)}
                  disabled={isFetching}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>{t('expireTime')}</Label>
                <p className='text-muted-foreground text-xs'>{t('expireTimeTip')}</p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  type='number'
                  min={0}
                  value={data?.sms_expire_time ?? 300}
                  onValueBlur={(value) => updateConfig('sms_expire_time', value)}
                  suffix='S'
                  disabled={isFetching}
                  placeholder={t('placeholders.expireTime')}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='align-top'>
                <Label>{t('interval')}</Label>
                <p className='text-muted-foreground text-xs'>{t('intervalTip')}</p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  type='number'
                  value={data?.sms_interval ?? 60}
                  min={0}
                  onValueBlur={(value) => updateConfig('sms_interval', value)}
                  suffix='S'
                  disabled={isFetching}
                  placeholder={t('placeholders.interval')}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>{t('limit')}</Label>
                <p className='text-muted-foreground text-xs'>{t('limitTip')}</p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  type='number'
                  value={data?.sms_limit ?? 20}
                  min={0}
                  onValueBlur={(value) => updateConfig('sms_limit', value)}
                  disabled={isFetching}
                  placeholder={t('placeholders.limit')}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>{t('platform')}</Label>
                <p className='text-muted-foreground text-xs'>{t('platformTip')}</p>
              </TableCell>
              <TableCell className='flex items-center gap-1 text-right'>
                <Select
                  value={data?.sms_platform}
                  onValueChange={(value) => updateConfig('sms_platform', value)}
                  disabled={isFetching}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms?.map((item) => (
                      <SelectItem key={item.platform} value={item.platform}>
                        {item.platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {platform_url && (
                  <Button size='sm' asChild>
                    <Link href={platform_url} target='_blank'>
                      {t('applyPlatform')}
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>Key</Label>
                <p className='text-muted-foreground text-xs'>
                  {t('platformConfigTip', { key: platformConfig?.sms_key })}
                </p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  value={data?.sms_key ?? ''}
                  onValueBlur={(value) => updateConfig('sms_key', value)}
                  disabled={isFetching}
                  placeholder={t('platformConfigTip', { key: platformConfig?.sms_key })}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>Secret</Label>
                <p className='text-muted-foreground text-xs'>
                  {t('platformConfigTip', { key: platformConfig?.sms_secret })}
                </p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  value={data?.sms_secret ?? ''}
                  onValueBlur={(value) => updateConfig('sms_secret', value)}
                  disabled={isFetching}
                  type='password'
                  placeholder={t('platformConfigTip', { key: platformConfig?.sms_secret })}
                />
              </TableCell>
            </TableRow>
            {platformConfig?.sms_template_code && (
              <TableRow>
                <TableCell>
                  <Label>{t('templateCode')}</Label>
                  <p className='text-muted-foreground text-xs'>
                    {t('platformConfigTip', { key: platformConfig?.sms_template_code })}
                  </p>
                </TableCell>
                <TableCell className='text-right'>
                  <EnhancedInput
                    value={data?.sms_template_code ?? ''}
                    onValueBlur={(value) => updateConfig('sms_template_code', value)}
                    disabled={isFetching}
                    placeholder={t('platformConfigTip', { key: platformConfig?.sms_template_code })}
                  />
                </TableCell>
              </TableRow>
            )}
            {platformConfig?.sms_template_param && (
              <TableRow>
                <TableCell>
                  <Label>{t('templateParam')}</Label>
                  <p className='text-muted-foreground text-xs'>
                    {t('platformConfigTip', { key: platformConfig?.sms_template_param })}
                  </p>
                </TableCell>
                <TableCell className='text-right'>
                  <EnhancedInput
                    value={data?.sms_template_param ?? 'code'}
                    onValueBlur={(value) => updateConfig('sms_template_param', value)}
                    disabled={isFetching}
                    placeholder={t('platformConfigTip', {
                      key: platformConfig?.sms_template_param,
                    })}
                  />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>
                <Label>{t('template')}</Label>
                <p className='text-muted-foreground text-xs'>
                  {t('templateTip', { code: platformConfig?.sms_template })}
                </p>
              </TableCell>
              <TableCell className='text-right'>
                <Textarea
                  defaultValue={data?.sms_template ?? ''}
                  onBlur={(e) => updateConfig('sms_template', e.target.value)}
                  disabled={isFetching}
                  placeholder={t('placeholders.template', { code: platformConfig?.sms_template })}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>{t('testSms')}</Label>
                <p className='text-muted-foreground text-xs'>{t('testSmsTip')}</p>
              </TableCell>
              <TableCell className='flex items-center gap-2 text-right'>
                <AreaCodeSelect
                  value={params.area_code}
                  onChange={(value) => {
                    if (value.phone) {
                      setParams((prev) => ({ ...prev, area_code: value.phone! }));
                    }
                  }}
                />
                <EnhancedInput
                  placeholder={t('testSmsPhone')}
                  value={params.telephone}
                  onValueChange={(value) => {
                    setParams((prev) => ({ ...prev, telephone: value as string }));
                  }}
                />
                <Button
                  disabled={!params.telephone || !params.area_code}
                  onClick={async () => {
                    if (isFetching || !params.telephone || !params.area_code) return;
                    try {
                      await testSmsSend(params);
                      toast.success(t('sendSuccess'));
                    } catch {
                      toast.error(t('sendFailed'));
                    }
                  }}
                >
                  {t('testSms')}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value='logs'>
        <LogsTable />
      </TabsContent>
    </Tabs>
  );
}

function LogsTable() {
  const t = useTranslations('phone');
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.Sms, { telephone: string }>
      action={ref}
      header={{
        title: t('SmsList'),
      }}
      columns={[
        {
          accessorKey: 'platform',
          header: t('platform'),
        },
        {
          accessorKey: 'areaCode',
          header: t('areaCode'),
        },
        {
          accessorKey: 'telephone',
          header: t('telephone'),
        },
        {
          accessorKey: 'content',
          header: t('content'),
        },
        {
          accessorKey: 'status',
          header: t('status'),
          cell: ({ row }) => {
            const status = row.getValue('status');
            const text = status === 1 ? t('sendSuccess') : t('sendFailed');
            return <Badge variant={status === 1 ? 'default' : 'destructive'}>{text}</Badge>;
          },
        },
        {
          accessorKey: 'created_at',
          header: t('createdAt'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      params={[
        {
          key: 'telephone',
          placeholder: t('search'),
        },
      ]}
      request={async (pagination, filter) => {
        const { data } = await getSmsList({ ...pagination, ...filter });
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
    />
  );
}
