'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@workspace/ui/components/form';
import { Switch } from '@workspace/ui/components/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const notifySettingsSchema = z.object({
  enable_email_notify: z.boolean(),
  enable_telegram_notify: z.boolean(),
  enable_balance_notify: z.boolean(),
  enable_login_notify: z.boolean(),
  enable_subscribe_notify: z.boolean(),
  enable_trade_notify: z.boolean(),
});

type NotifySettingsValues = z.infer<typeof notifySettingsSchema>;

export function NotifySettingsForm({ user }: { user: API.User }) {
  const form = useForm<NotifySettingsValues>({
    resolver: zodResolver(notifySettingsSchema),
    defaultValues: {
      enable_email_notify: user.enable_email_notify,
      enable_telegram_notify: user.enable_telegram_notify,
      enable_balance_notify: user.enable_balance_notify,
      enable_login_notify: user.enable_login_notify,
      enable_subscribe_notify: user.enable_subscribe_notify,
      enable_trade_notify: user.enable_trade_notify,
    },
  });

  async function onSubmit(data: NotifySettingsValues) {
    toast.warning('In Development...');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Notification Settings</CardTitle>
            <Button type='submit' size='sm'>
              Save
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4'>
              <FormField
                control={form.control}
                name='enable_email_notify'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-x-2'>
                    <FormLabel>Email Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='enable_telegram_notify'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-x-2'>
                    <FormLabel>Telegram Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='enable_balance_notify'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-x-2'>
                    <FormLabel>Balance Change Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='enable_login_notify'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-x-2'>
                    <FormLabel>Login Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='enable_subscribe_notify'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-x-2'>
                    <FormLabel>Subscription Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='enable_trade_notify'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-x-2'>
                    <FormLabel>Trade Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
