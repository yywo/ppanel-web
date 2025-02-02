'use client';

import useGlobalStore from '@/config/use-global';
import { updateUser } from '@/services/admin/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { UploadImage } from '@workspace/ui/custom-components/upload-image';
import { unitConversion } from '@workspace/ui/utils';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const basicInfoSchema = z.object({
  avatar: z.string().optional(),
  balance: z.number().optional(),
  commission: z.number().optional(),
  gift_amount: z.number().optional(),
  refer_code: z.string().optional(),
  referer_id: z.number().optional(),
  is_admin: z.boolean().optional(),
  password: z.string().optional(),
  enable: z.boolean(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

export function BasicInfoForm({ user }: { user: API.User }) {
  const { common } = useGlobalStore();
  const { currency } = common;

  const form = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      avatar: user.avatar,
      balance: user.balance,
      commission: user.commission,
      gift_amount: user.gift_amount,
      refer_code: user.refer_code,
      referer_id: user.referer_id,
      is_admin: user.is_admin,
      enable: user.enable,
    },
  });

  async function onSubmit(data: BasicInfoValues) {
    await updateUser({
      id: user.id,
      ...data,
    } as API.UpdateUserRequest);
    toast.success('Saved successfully');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Basic Information</CardTitle>
            <Button type='submit' size='sm'>
              Save
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='enable'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between space-x-2'>
                  <FormLabel>Account Enable</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='is_admin'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between space-x-2'>
                  <FormLabel>Administrator</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='balance'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        type='number'
                        value={field.value}
                        prefix={currency?.currency_symbol ?? '$'}
                        formatInput={(value) => unitConversion('centsToDollars', value)}
                        formatOutput={(value) => unitConversion('dollarsToCents', value)}
                        onValueChange={(value) => {
                          form.setValue(field.name, value as number);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='commission'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        type='number'
                        value={field.value}
                        prefix={currency?.currency_symbol ?? '$'}
                        formatInput={(value) => unitConversion('centsToDollars', value)}
                        formatOutput={(value) => unitConversion('dollarsToCents', value)}
                        onValueChange={(value) => {
                          form.setValue(field.name, value as number);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gift_amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Amount</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        type='number'
                        value={field.value}
                        prefix={currency?.currency_symbol ?? '$'}
                        formatInput={(value) => unitConversion('centsToDollars', value)}
                        formatOutput={(value) => unitConversion('dollarsToCents', value)}
                        onValueChange={(value) => {
                          form.setValue(field.name, value as number);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='refer_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Code</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue(field.name, value as string);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='referer_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referrer (User ID)</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        type='number'
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue(field.name, value as number);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='avatar'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <EnhancedInput
                      value={field.value}
                      onValueChange={(value) => {
                        form.setValue(field.name, value as string);
                      }}
                      suffix={
                        <UploadImage
                          className='bg-muted h-9 rounded-none border-none px-2'
                          returnType='base64'
                          onChange={(value) => form.setValue('avatar', value as string)}
                        />
                      }
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='Leave empty to keep unchanged' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
