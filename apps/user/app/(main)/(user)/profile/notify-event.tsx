'use client';

import useGlobalStore from '@/config/use-global';
import { updateUserNotify } from '@/services/user/user';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shadcn/ui/form';
import { useForm } from '@shadcn/ui/lib/react-hook-form';
import { toast } from '@shadcn/ui/lib/sonner';
import { z, zodResolver } from '@shadcn/ui/lib/zod';
import { Switch } from '@shadcn/ui/switch';
import { useTranslations } from 'next-intl';

const FormSchema = z.object({
  enable_balance_notify: z.boolean(),
  enable_login_notify: z.boolean(),
  enable_subscribe_notify: z.boolean(),
  enable_trade_notify: z.boolean(),
});

export default function NotifyEvent() {
  const t = useTranslations('profile.notifyEvent');
  const { user, getUserInfo } = useGlobalStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      enable_balance_notify: user?.enable_balance_notify,
      enable_login_notify: user?.enable_login_notify,
      enable_subscribe_notify: user?.enable_subscribe_notify,
      enable_trade_notify: user?.enable_trade_notify,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateUserNotify(data);
    toast.success(t('updateSuccess'));
    getUserInfo();
  }

  return (
    <Card>
      <CardHeader className='bg-muted/50 flex flex-row items-start'>
        <CardTitle>{t('notificationEvents')}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4 p-6 text-sm'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
            <FormField
              control={form.control}
              name='enable_balance_notify'
              render={({ field }) => (
                <FormItem className='text-muted-foreground flex items-center justify-between'>
                  <FormLabel>{t('balanceChange')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='enable_login_notify'
              render={({ field }) => (
                <FormItem className='text-muted-foreground flex items-center justify-between'>
                  <FormLabel>{t('login')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='enable_subscribe_notify'
              render={({ field }) => (
                <FormItem className='text-muted-foreground flex items-center justify-between'>
                  <FormLabel>{t('subscribe')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='enable_trade_notify'
              render={({ field }) => (
                <FormItem className='text-muted-foreground flex items-center justify-between'>
                  <FormLabel>{t('finance')}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        form.handleSubmit(onSubmit)();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
