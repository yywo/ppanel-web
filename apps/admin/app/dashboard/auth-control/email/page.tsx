'use client';

import { getEmailSmtpConfig, testEmailSmtp, updateEmailSmtpConfig } from '@/services/admin/system';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Table, TableBody, TableCell, TableRow } from '@workspace/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { HTMLEditor } from '@workspace/ui/custom-components/editor';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ConfigProps {
  data?: Record<string, any> & API.EmailSmtpConfig;
  updateConfig: (key: string, value: unknown) => Promise<void>;
  isFetching?: boolean;
}

export default function Page() {
  const t = useTranslations('email');
  const ref = useRef<Partial<API.EmailSmtpConfig>>({});

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['getEmailSmtpConfig'],
    queryFn: async () => {
      const { data } = await getEmailSmtpConfig();
      ref.current = data.data as API.EmailSmtpConfig;
      return data.data;
    },
  });

  async function updateConfig(key: string, value: unknown) {
    if (data?.[key] === value) return;
    try {
      await updateEmailSmtpConfig({
        ...ref.current,
        [key]: value,
      } as API.EmailSmtpConfig);
      toast.success(t('saveSuccess'));
      refetch();
    } catch (error) {
      /* empty */
    }
  }
  const [email, setEmail] = useState<string>();

  return (
    <Tabs defaultValue='basic'>
      <TabsList>
        <TabsTrigger value='basic'>{t('emailBasicConfig')}</TabsTrigger>
        <TabsTrigger value='template'>{t('emailTemplate')}</TabsTrigger>
        <TabsTrigger value='logs'>{t('emailLogs')}</TabsTrigger>
      </TabsList>

      <div className='flex-1'>
        <TabsContent value='basic'>
          <Table>
            <TableBody>
              {[
                {
                  key: 'email_smtp_host',
                  label: t('smtpServerAddress'),
                  description: t('smtpServerAddressDescription'),
                },
                {
                  key: 'email_smtp_port',
                  label: t('smtpServerPort'),
                  description: t('smtpServerPortDescription'),
                  type: 'number',
                },
                {
                  key: 'email_smtp_ssl',
                  label: t('smtpEncryptionMethod'),
                  description: t('smtpEncryptionMethodDescription'),
                  component: 'switch',
                },
                {
                  key: 'email_smtp_user',
                  label: t('smtpAccount'),
                  description: t('smtpAccountDescription'),
                },
                {
                  key: 'email_smtp_pass',
                  label: t('smtpPassword'),
                  description: t('smtpPasswordDescription'),
                  type: 'password',
                },
                {
                  key: 'email_smtp_from',
                  label: t('senderAddress'),
                  description: t('senderAddressDescription'),
                },
              ].map(({ key, label, description, type = 'text', component = 'input' }) => (
                <TableRow key={key}>
                  <TableCell>
                    <Label>{label}</Label>
                    <p className='text-muted-foreground text-xs'>{description}</p>
                  </TableCell>
                  <TableCell className='text-right'>
                    {component === 'input' ? (
                      <EnhancedInput
                        placeholder={t('inputPlaceholder')}
                        value={data?.[key]}
                        type={type}
                        onValueBlur={(value) => updateConfig(key, value)}
                      />
                    ) : (
                      <Switch
                        checked={data?.[key]}
                        onCheckedChange={(checked) => updateConfig(key, checked)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <Label>{t('sendTestEmail')}</Label>
                  <p className='text-muted-foreground text-xs'>{t('sendTestEmailDescription')}</p>
                </TableCell>
                <TableCell className='flex items-center gap-2 text-right'>
                  <EnhancedInput
                    placeholder={t('inputPlaceholder')}
                    value={email}
                    onValueChange={(value) => setEmail(value as string)}
                  />
                  <Button
                    disabled={!email}
                    onClick={async () => {
                      if (isFetching || !email) return;
                      try {
                        await testEmailSmtp({ email });
                        toast.success(t('sendSuccess'));
                      } catch {
                        toast.error(t('sendFailure'));
                      }
                    }}
                  >
                    {t('sendTestEmail')}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value='template'>
          <div className='grid grid-cols-1 gap-4 py-4 md:grid-cols-3'>
            {[
              'verify_email_template',
              'expiration_email_template',
              'maintenance_email_template',
            ].map((templateKey) => (
              <HTMLEditor
                key={templateKey}
                title={t(`${templateKey}`)}
                description={t(`${templateKey}Description`, { after: '{{', before: '}}' })}
                placeholder={t('inputPlaceholder')}
                value={data?.[templateKey as keyof API.EmailSmtpConfig] as string}
                onBlur={(value) => {
                  updateConfig(templateKey, value);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value='logs'>
          <div>
            <p>TODO: placeholder for email logs</p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
