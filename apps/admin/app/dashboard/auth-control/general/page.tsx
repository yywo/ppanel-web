'use client';

import { getRegisterConfig, updateRegisterConfig } from '@/services/admin/system';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function Page() {
  const t = useTranslations('auth-control');

  const { data, refetch } = useQuery({
    queryKey: ['getRegisterConfig'],
    queryFn: async () => {
      const { data } = await getRegisterConfig();

      return data.data;
    },
  });

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateRegisterConfig({
        ...data,
        [key]: value,
      } as API.RegisterConfig);
      toast.success(t('saveSuccess'));
      refetch();
    } catch (error) {
      /* empty */
    }
  }

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>
            <Label>{t('stopNewUserRegistration')}</Label>
            <p className='text-muted-foreground text-xs'>
              {t('stopNewUserRegistrationDescription')}
            </p>
          </TableCell>
          <TableCell className='text-right'>
            <Switch
              checked={data?.stop_register}
              onCheckedChange={(checked) => {
                updateConfig('stop_register', checked);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('ipRegistrationLimit')}</Label>
            <p className='text-muted-foreground text-xs'>{t('ipRegistrationLimitDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Switch
              checked={data?.enable_ip_register_limit}
              onCheckedChange={(checked) => {
                updateConfig('enable_ip_register_limit', checked);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('registrationLimitCount')}</Label>
            <p className='text-muted-foreground text-xs'>
              {t('registrationLimitCountDescription')}
            </p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              type='number'
              min={0}
              value={data?.ip_register_limit}
              onValueBlur={(value) => updateConfig('ip_register_limit', value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('penaltyTime')}</Label>
            <p className='text-muted-foreground text-xs'>{t('penaltyTimeDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              type='number'
              min={0}
              value={data?.ip_register_limit_duration}
              onValueBlur={(value) => updateConfig('ip_register_limit_duration', value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('trialRegistration')}</Label>
            <p className='text-muted-foreground text-xs'>{t('trialRegistrationDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Switch
              checked={data?.enable_trial}
              onCheckedChange={(checked) => {
                updateConfig('enable_trial', checked);
              }}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
