'use client';

import { getAuthMethodConfig, updateAuthMethodConfig } from '@/services/admin/authMethod';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function Page() {
  const t = useTranslations('imei');

  const { data, refetch } = useQuery({
    queryKey: ['getAuthMethodConfig', 'imei'],
    queryFn: async () => {
      const { data } = await getAuthMethodConfig({
        method: 'imei',
      });
      return data.data;
    },
  });

  async function updateConfig(key: keyof API.UpdataAuthMethodConfigRequest, value: unknown) {
    try {
      await updateAuthMethodConfig({
        ...data,
        [key]: value,
      } as API.UpdataAuthMethodConfigRequest);
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
      </TableBody>
    </Table>
  );
}
