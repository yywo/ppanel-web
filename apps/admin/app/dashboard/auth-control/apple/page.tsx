'use client';

import { getOAuthConfig, oAuthCreateConfig, updateOAuthConfig } from '@/services/admin/system';
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
    queryKey: ['getOAuthConfig', 'apple'],
    queryFn: async () => {
      const { data } = await getOAuthConfig();
      return data.data?.list.find((item) => item.platform === 'apple') as API.OAuthConfig;
    },
  });

  async function updateConfig(key: keyof API.OAuthConfig, value: unknown) {
    if (data?.[key] === value) return;
    try {
      if (data?.id) {
        await oAuthCreateConfig({
          ...data,
          platform: 'apple',
          [key]: value,
        } as API.OAuthConfig);
      } else {
        await updateOAuthConfig({
          ...data,
          [key]: value,
        } as API.OAuthConfig);
      }
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
              value={data?.team_id}
              onValueBlur={(value) => updateConfig('team_id', value)}
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
              value={data?.client_id}
              onValueBlur={(value) => updateConfig('client_id', value)}
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
              value={data?.key_id}
              onValueBlur={(value) => updateConfig('key_id', value)}
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
              value={data?.client_secret}
              onBlur={(e) => updateConfig('client_secret', e.target.value)}
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
