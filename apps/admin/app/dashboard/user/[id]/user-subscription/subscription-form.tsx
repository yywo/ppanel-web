'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  trigger: ReactNode;
  title: string;
  loading?: boolean;
  userId: string;
  initialData?: API.Subscribe;
  onSubmit: (values: any) => Promise<boolean>;
}

export function SubscriptionForm({
  trigger,
  title,
  loading,
  userId,
  initialData,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      user_id: userId,
      name: initialData?.name || '',
      traffic: initialData?.traffic || 0,
      speed_limit: initialData?.speed_limit || 0,
      device_limit: initialData?.device_limit || 0,
      ...(initialData && { id: initialData.id }),
    },
  });

  const handleSubmit = async (values: any) => {
    const success = await onSubmit(values);
    if (success) {
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='mt-4 space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='traffic'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traffic (Bytes)</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='speed_limit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speed Limit (Mbps)</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='device_limit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Limit</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Submit</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
