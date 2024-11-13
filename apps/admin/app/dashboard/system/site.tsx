'use client';

import { getSiteConfig, updateSiteConfig } from '@/services/admin/system';
import { EnhancedInput } from '@repo/ui/enhanced-input';
import { Label } from '@shadcn/ui/label';
import { toast } from '@shadcn/ui/lib/sonner';
import { Table, TableBody, TableCell, TableRow } from '@shadcn/ui/table';
import { Textarea } from '@shadcn/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

export default function Site() {
  const t = useTranslations('system.site');

  const { data, refetch } = useQuery({
    queryKey: ['getSiteConfig'],
    queryFn: async () => {
      const { data } = await getSiteConfig();
      return data.data;
    },
  });

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateSiteConfig({
        ...data,
        [key]: value,
      } as API.SiteConfig);
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
            <Label>{t('logo')}</Label>
            <p className='text-muted-foreground text-xs'>{t('logoDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder={t('logoPlaceholder')}
              value={data?.site_logo}
              onValueBlur={(value) => updateConfig('site_logo', value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('siteName')}</Label>
            <p className='text-muted-foreground text-xs'>{t('siteNameDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder={t('siteNamePlaceholder')}
              value={data?.site_name}
              onValueBlur={(value) => updateConfig('site_name', value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Label>{t('siteDesc')}</Label>
            <p className='text-muted-foreground text-xs'>{t('siteDescDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <EnhancedInput
              placeholder={t('siteDescPlaceholder')}
              value={data?.site_desc}
              onValueBlur={(value) => updateConfig('site_desc', value)}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className='align-top'>
            <Label>{t('siteDomain')}</Label>
            <p className='text-muted-foreground text-xs'>{t('siteDomainDescription')}</p>
          </TableCell>
          <TableCell className='text-right'>
            <Textarea
              className='h-52'
              placeholder={t('siteDomainPlaceholder')}
              defaultValue={data?.host}
              onBlur={(e) => {
                updateConfig('host', e.target.value);
              }}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
