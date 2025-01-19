'use client';

import { getOAuthByPlatform, updateOAuthConfig } from '@/services/admin/system';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { Textarea } from '@workspace/ui/components/textarea';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function Page() {
  const t = useTranslations('apple');

  const { data, refetch } = useQuery({
    queryKey: ['getOAuthByPlatform', 'apple'],
    queryFn: async () => {
      const { data } = await getOAuthByPlatform({
        platform: 'apple',
      });
      return data.data;
    },
  });

  async function updateConfig(key: keyof API.UpdateOAuthConfig, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateOAuthConfig({
        ...data,
        [key]: value,
      } as API.UpdateOAuthConfig);
      toast.success(t('saveSuccess'));
      refetch();
    } catch (error) {
      toast.error(t('saveFailed'));
    }
  }

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>
            <Label>{t('enable')}</Label>
            <p className='text-muted-foreground text-xs'>{t('enableDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Switch
              checked={data?.enabled}
              onCheckedChange={(checked) => updateConfig('enabled', checked)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('teamId')}</Label>
            <p className='text-muted-foreground text-xs'>{t('teamIdDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder='ABCDE1FGHI'
              value={data?.config?.team_id}
              onValueBlur={(value) => {
                updateConfig('config', {
                  ...data?.config,
                  team_id: value,
                });
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('keyId')}</Label>
            <p className='text-muted-foreground text-xs'>{t('keyIdDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder='ABC1234567'
              value={data?.config?.key_id}
              onValueBlur={(value) => {
                updateConfig('config', {
                  ...data?.config,
                  key_id: value,
                });
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('clientId')}</Label>
            <p className='text-muted-foreground text-xs'>{t('clientIdDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder='com.your.app.service'
              value={data?.config?.client_id}
              onValueBlur={(value) => {
                updateConfig('config', {
                  ...data?.config,
                  client_id: value,
                });
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='align-top'>
            <Label>{t('clientSecret')}</Label>
            <p className='text-muted-foreground text-xs'>{t('clientSecretDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Textarea
              className='h-20'
              placeholder={`-----BEGIN PRIVATE KEY-----\nMIGTAgEA...\n-----END PRIVATE KEY-----`}
              value={data?.config?.client_secret}
              onBlur={(e) => {
                updateConfig('config', {
                  ...data?.config,
                  client_secret: e.target.value,
                });
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('redirectUri')}</Label>
            <p className='text-muted-foreground text-xs'>{t('redirectUriDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder='https://your-domain.com/v1/auth/oauth/callback/apple'
              value={data?.redirect}
              onValueBlur={(value) => updateConfig('redirect', value)}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
