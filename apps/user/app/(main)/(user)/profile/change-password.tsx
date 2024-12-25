'use client';

import { updateUserPassword } from '@/services/user/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function ChangePassword() {
  const t = useTranslations('profile.accountSettings');

  const FormSchema = z
    .object({
      password: z.string(),
      repeat_password: z.string(),
    })
    .superRefine(({ password, repeat_password }, ctx) => {
      if (password !== repeat_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('passwordMismatch'),
          path: ['repeat_password'],
        });
      }
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateUserPassword({
      password: data.password,
    } as API.UpdateUserPasswordRequest);
    toast.success(t('updateSuccess'));
    form.setValue('password', '');
    form.setValue('repeat_password', '');
  }

  return (
    <Card>
      <CardHeader className='bg-muted/50 flex flex-row items-start'>
        <CardTitle>{t('accountSettings')}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4 p-6 text-sm'>
        <div className='grid gap-3'>
          <div className='font-semibold'>{t('loginPassword')}</div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type='password' placeholder={t('newPassword')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='repeat_password'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type='password' placeholder={t('repeatNewPassword')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='size-full' type='submit'>
                {t('updatePassword')}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
