import useGlobalStore from '@/config/use-global';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import SendCode from '../send-code';
import CloudFlareTurnstile from '../turnstile';

export default function ResetForm({
  loading,
  onSubmit,
  initialValues,
  setInitialValues,
  onSwitchForm,
}: {
  loading?: boolean;
  onSubmit: (data: any) => void;
  initialValues: any;
  setInitialValues: Dispatch<SetStateAction<any>>;
  onSwitchForm: Dispatch<SetStateAction<'register' | 'reset' | 'login'>>;
}) {
  const t = useTranslations('auth.reset');

  const { common } = useGlobalStore();
  const { verify, auth } = common;

  const formSchema = z.object({
    email: z.string().email(t('email')),
    password: z.string(),
    code: auth?.email?.enable_verify ? z.string() : z.string().nullish(),
    cf_token:
      verify.enable_register_verify && verify.turnstile_site_key
        ? z.string()
        : z.string().nullish(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder='Enter your email...' type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='flex items-center gap-2'>
                    <Input
                      placeholder='Enter code...'
                      type='text'
                      {...field}
                      value={field.value as string}
                    />
                    <SendCode
                      type='email'
                      params={{
                        ...form.getValues(),
                        type: 2,
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder='Enter your New password...' type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {verify.enable_reset_password_verify && (
            <FormField
              control={form.control}
              name='cf_token'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CloudFlareTurnstile id='reset' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type='submit' disabled={loading}>
            {loading && <Icon icon='mdi:loading' className='animate-spin' />}
            {t('title')}
          </Button>
        </form>
      </Form>
      <div className='mt-4 text-right text-sm'>
        {t('existingAccount')}&nbsp;
        <Button
          variant='link'
          className='p-0'
          onClick={() => {
            setInitialValues(undefined);
            onSwitchForm('login');
          }}
        >
          {t('switchToLogin')}
        </Button>
      </div>
    </>
  );
}
