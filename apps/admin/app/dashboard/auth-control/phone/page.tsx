'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  getAuthMethodConfig,
  getSmsPlatform,
  testSmsSend,
  updateAuthMethodConfig,
} from '@/services/admin/authMethod';
import { getSmsList } from '@/services/admin/sms';
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
import TagInput from '@workspace/ui/custom-components/tag-input';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const t = useTranslations('phone');
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['getAuthMethodConfig', 'mobile'],
    queryFn: async () => {
      const { data } = await getAuthMethodConfig({
        method: 'mobile',
      });
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

  const selectedPlatform = platforms?.find(
    (platform) => platform.platform === data?.config?.platform,
  );
  const { platform_url, platform_field_description: platformConfig } = selectedPlatform ?? {};

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;

    try {
      await updateAuthMethodConfig({
        ...data,
        [key]: value,
      } as API.UpdataAuthMethodConfigRequest);
      toast.success(t('updateSuccess'));
      refetch();
    } catch (error) {
      /* empty */
    }
  }
  const [params, setParams] = useState<API.TestSmsSendRequest>({
    telephone: '',
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
                  checked={data?.enabled}
                  onCheckedChange={(checked) => updateConfig('enabled', checked)}
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
                  value={data?.config?.expire_time ?? 300}
                  onValueBlur={(value) =>
                    updateConfig('config', {
                      ...data?.config,
                      expire_time: value,
                    })
                  }
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
                  value={data?.config?.interval ?? 60}
                  min={0}
                  onValueBlur={(value) =>
                    updateConfig('config', {
                      ...data?.config,
                      interval: value,
                    })
                  }
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
                  value={data?.config?.limit ?? 20}
                  min={0}
                  onValueBlur={(value) =>
                    updateConfig('config', {
                      ...data?.config,
                      limit: value,
                    })
                  }
                  disabled={isFetching}
                  placeholder={t('placeholders.limit')}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>{t('whitelistValidation')}</Label>
                <p className='text-muted-foreground text-xs'>{t('whitelistValidationTip')}</p>
              </TableCell>
              <TableCell className='text-right'>
                <Switch
                  defaultValue={data?.config?.enable_whitelist}
                  onCheckedChange={(checked) =>
                    updateConfig('config', { ...data?.config, enable_whitelist: checked })
                  }
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Label>{t('whitelistAreaCode')}</Label>
                <p className='text-muted-foreground text-xs'>{t('whitelistAreaCodeTip')}</p>
              </TableCell>
              <TableCell className='w-1/2 text-right'>
                <TagInput
                  placeholder='1, 852, 886, 888'
                  value={data?.config?.whitelist || []}
                  onChange={(value) =>
                    updateConfig('config', { ...data?.config, whitelist: value })
                  }
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
                  value={data?.platform}
                  onValueChange={(value) =>
                    updateConfig('config', {
                      ...data?.config,
                      platform: value,
                    })
                  }
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
                <Label>{t('accessLabel')}</Label>
                <p className='text-muted-foreground text-xs'>
                  {t('platformConfigTip', { key: platformConfig?.access })}
                </p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  value={data?.config?.platform_config.access ?? ''}
                  onValueBlur={(value) =>
                    updateConfig('config', {
                      ...data?.config,
                      platform_config: {
                        ...data?.config?.platform_config,
                        access: value,
                      },
                    })
                  }
                  disabled={isFetching}
                  placeholder={t('platformConfigTip', { key: platformConfig?.access })}
                />
              </TableCell>
            </TableRow>
            {platformConfig?.endpoint && (
              <TableRow>
                <TableCell>
                  <Label>{t('endpointLabel')}</Label>
                  <p className='text-muted-foreground text-xs'>
                    {t('platformConfigTip', { key: platformConfig?.endpoint })}
                  </p>
                </TableCell>
                <TableCell className='text-right'>
                  <EnhancedInput
                    value={data?.config?.platform_config.endpoint ?? ''}
                    onValueBlur={(value) =>
                      updateConfig('config', {
                        ...data?.config,
                        platform_config: {
                          ...data?.config?.platform_config,
                          endpoint: value,
                        },
                      })
                    }
                    disabled={isFetching}
                    placeholder={t('platformConfigTip', { key: platformConfig?.endpoint })}
                  />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>
                <Label>{t('secretLabel')}</Label>
                <p className='text-muted-foreground text-xs'>
                  {t('platformConfigTip', { key: platformConfig?.secret })}
                </p>
              </TableCell>
              <TableCell className='text-right'>
                <EnhancedInput
                  value={data?.config?.platform_config?.secret ?? ''}
                  onValueBlur={(value) =>
                    updateConfig('config', {
                      ...data?.config,
                      platform_config: {
                        ...data?.config?.platform_config,
                        secret: value,
                      },
                    })
                  }
                  disabled={isFetching}
                  type='password'
                  placeholder={t('platformConfigTip', { key: platformConfig?.secret })}
                />
              </TableCell>
            </TableRow>
            {platformConfig?.template_code && (
              <TableRow>
                <TableCell>
                  <Label>{t('templateCodeLabel')}</Label>
                  <p className='text-muted-foreground text-xs'>
                    {t('platformConfigTip', { key: platformConfig?.template_code })}
                  </p>
                </TableCell>
                <TableCell className='text-right'>
                  <EnhancedInput
                    value={data?.config?.platform_config?.template_code ?? 'code'}
                    onValueBlur={(value) =>
                      updateConfig('config', {
                        ...data?.config,
                        platform_config: {
                          ...data?.config?.platform_config,
                          template_code: value,
                        },
                      })
                    }
                    disabled={isFetching}
                    placeholder={t('platformConfigTip', { key: platformConfig?.template_code })}
                  />
                </TableCell>
              </TableRow>
            )}
            {platformConfig?.sign_name && (
              <TableRow>
                <TableCell>
                  <Label>{t('signNameLabel')}</Label>
                  <p className='text-muted-foreground text-xs'>
                    {t('platformConfigTip', { key: platformConfig?.sign_name })}
                  </p>
                </TableCell>
                <TableCell className='text-right'>
                  <EnhancedInput
                    value={data?.config?.platform_config?.sign_name ?? ''}
                    onValueBlur={(value) =>
                      updateConfig('config', {
                        ...data?.config,
                        platform_config: {
                          ...data?.config?.platform_config,
                          sign_name: value,
                        },
                      })
                    }
                    disabled={isFetching}
                    placeholder={t('platformConfigTip', {
                      key: platformConfig?.sign_name,
                    })}
                  />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>
                <Label>{t('template')}</Label>
                <p className='text-muted-foreground text-xs'>
                  {t('templateTip', { code: platformConfig?.code_variable })}
                </p>
              </TableCell>
              <TableCell className='text-right'>
                <Textarea
                  defaultValue={data?.platform_config?.template ?? ''}
                  onBlur={(e) =>
                    updateConfig('config', {
                      ...data?.config,
                      platform_config: {
                        ...data?.config?.platform_config,
                        template: e.target.value,
                      },
                    })
                  }
                  disabled={isFetching}
                  placeholder={t('placeholders.template', { code: platformConfig?.code_variable })}
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
    <ProTable<API.SMS, { telephone: string }>
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
