'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Textarea } from '@workspace/ui/components/textarea';
import { MarkdownEditor } from '@workspace/ui/custom-components/editor';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const emailBroadcastSchema = z.object({
  subject: z.string().min(1, 'Email subject cannot be empty'),
  content: z.string().min(1, 'Email content cannot be empty'),
  // Send settings
  additional_emails: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true;
        const emails = value.split('\n').filter((email) => email.trim() !== '');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every((email) => emailRegex.test(email.trim()));
      },
      {
        message: 'Please enter valid email addresses, one per line',
      },
    ),
  // Send time settings
  scheduled_time: z.string().optional(),
  user_filters: z.object({
    subscription_status: z.string().optional(),
    registration_date_from: z.string().optional(),
    registration_date_to: z.string().optional(),
    user_groups: z.array(z.string()).default([]),
  }),
  rate_limit: z.object({
    email_interval_seconds: z
      .number()
      .min(1, 'Email interval (seconds) cannot be less than 1')
      .default(1),
    daily_limit: z.number().min(1, 'Daily limit must be at least 1').default(1000),
  }),
});

type EmailBroadcastFormData = z.infer<typeof emailBroadcastSchema>;

export default function EmailBroadcastForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimatedRecipients, setEstimatedRecipients] = useState<{
    users: number;
    additional: number;
    total: number;
  }>({ users: 0, additional: 0, total: 0 });

  const form = useForm<EmailBroadcastFormData>({
    resolver: zodResolver(emailBroadcastSchema),
    defaultValues: {
      subject: '',
      content: '',
      additional_emails: '',
      scheduled_time: '',
      user_filters: {
        subscription_status: 'all',
        registration_date_from: '',
        registration_date_to: '',
        user_groups: [],
      },
      rate_limit: {
        email_interval_seconds: 1,
        daily_limit: 1000,
      },
    },
  });

  // Calculate recipient count
  const calculateRecipients = () => {
    const formData = form.getValues();

    // Simulate user data statistics (should call API in real implementation)
    let userCount = 0;

    const sendingScope = formData.user_filters.subscription_status;
    if (sendingScope === 'skip') {
      // Send only to additional emails
      userCount = 0;
    } else {
      let baseCount = 1500;

      if (sendingScope === 'active') {
        baseCount = Math.floor(baseCount * 0.3); // 30% active subscription users
      } else if (sendingScope === 'expired') {
        baseCount = Math.floor(baseCount * 0.2); // 20% expired subscription users
      } else if (sendingScope === 'none') {
        baseCount = Math.floor(baseCount * 0.5); // 50% no subscription users
      }
      // If 'all' or empty, keep baseCount unchanged (all platform users)

      // Date filter impact (simplified calculation)
      if (
        formData.user_filters.registration_date_from ||
        formData.user_filters.registration_date_to
      ) {
        baseCount = Math.floor(baseCount * 0.7); // Estimate about 70% after date filtering
      }

      userCount = baseCount;
    }

    // Calculate additional email count
    const additionalEmails = formData.additional_emails || '';
    const additionalCount = additionalEmails
      .split('\n')
      .filter((email: string) => email.trim() !== '').length;

    const total = userCount + additionalCount;

    setEstimatedRecipients({
      users: userCount,
      additional: additionalCount,
      total,
    });
  };

  // Listen to form changes
  const watchedValues = form.watch();

  // Use useEffect to respond to form changes
  useEffect(() => {
    calculateRecipients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.user_filters?.subscription_status,
    watchedValues.user_filters?.registration_date_from,
    watchedValues.user_filters?.registration_date_to,
    watchedValues.additional_emails,
  ]);

  const onSubmit = async (data: EmailBroadcastFormData) => {
    setLoading(true);
    try {
      // Validate scheduled send time
      if (data.scheduled_time && data.scheduled_time.trim() !== '') {
        const scheduledDate = new Date(data.scheduled_time);
        const now = new Date();
        if (scheduledDate <= now) {
          toast.error('Scheduled send time must be later than current time');
          return;
        }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Email broadcast data:', data);

      if (!data.scheduled_time || data.scheduled_time.trim() === '') {
        toast.success('Email sent successfully');
      } else {
        toast.success('Email added to scheduled send queue');
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Send failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className='flex cursor-pointer items-center justify-between transition-colors'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <Icon icon='mdi:email-send' className='text-primary h-5 w-5' />
            </div>
            <div className='flex-1'>
              <p className='font-medium'>Email Broadcast</p>
              <p className='text-muted-foreground text-sm'>Create new email broadcast campaign</p>
            </div>
          </div>
          <Icon icon='mdi:chevron-right' className='size-6' />
        </div>
      </SheetTrigger>
      <SheetContent className='w-[700px] max-w-full md:max-w-screen-lg'>
        <SheetHeader>
          <SheetTitle>Create Email Broadcast</SheetTitle>
        </SheetHeader>
        <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-6'>
          <Form {...form}>
            <form
              id='broadcast-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-2 pt-4'
            >
              <Tabs defaultValue='content' className='space-y-2'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='content'>Email Content</TabsTrigger>
                  <TabsTrigger value='settings'>Send Settings</TabsTrigger>
                </TabsList>
                {/* Email Content Tab */}
                <TabsContent value='content' className='space-y-2'>
                  <FormField
                    control={form.control}
                    name='subject'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input placeholder='Please enter email subject' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Content</FormLabel>
                        <FormControl>
                          <MarkdownEditor
                            value={field.value}
                            onChange={(value) => {
                              form.setValue(field.name, value || '');
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Use Markdown editor to write email content with preview functionality
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Send Settings Tab */}
                <TabsContent value='settings' className='space-y-2'>
                  {/* Send scope and estimated recipients */}
                  <div className='grid grid-cols-2 items-center gap-4'>
                    <FormField
                      control={form.control}
                      name='user_filters.subscription_status'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Send Scope</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || 'all'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select send scope' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='all'>All platform users</SelectItem>
                              <SelectItem value='active'>Active subscription users only</SelectItem>
                              <SelectItem value='expired'>
                                Expired subscription users only
                              </SelectItem>
                              <SelectItem value='none'>No subscription users only</SelectItem>
                              <SelectItem value='skip'>
                                Additional emails only (skip platform users)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the user scope for email sending. Select &ldquo;Additional emails
                            only&rdquo; to send only to the email addresses filled below
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Estimated recipients info */}
                    <div className='flex justify-end'>
                      <div className='border-l-primary bg-primary/10 border-l-4 px-4 py-3 text-sm'>
                        <span className='text-muted-foreground'>Estimated recipients: </span>
                        <span className='text-primary text-lg font-medium'>
                          {estimatedRecipients.total}
                        </span>
                        <span className='text-muted-foreground ml-2 text-xs'>
                          (users: {estimatedRecipients.users}, additional:{' '}
                          {estimatedRecipients.additional})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='user_filters.registration_date_from'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Start Date</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              type='datetime-local'
                              disabled={form.watch('user_filters.subscription_status') === 'skip'}
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Include users registered on or after this date
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='user_filters.registration_date_to'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration End Date</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              type='datetime-local'
                              disabled={form.watch('user_filters.subscription_status') === 'skip'}
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Include users registered on or before this date
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional recipients */}
                  <FormField
                    control={form.control}
                    name='additional_emails'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Recipient Emails</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Please enter additional recipient emails, one per line, for example:\nexample1@domain.com\nexample2@domain.com\nexample3@domain.com`}
                            className='min-h-[120px] font-mono text-sm'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These emails will receive the email additionally, not affected by the user
                          filter conditions above
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Send time settings */}
                  <FormField
                    control={form.control}
                    name='scheduled_time'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Send</FormLabel>
                        <FormControl>
                          <EnhancedInput
                            type='datetime-local'
                            placeholder='Leave empty for immediate send'
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Select send time, leave empty for immediate send
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Send rate control */}
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='rate_limit.email_interval_seconds'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Interval (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={0}
                              step={0.1}
                              placeholder='1'
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription>Interval time between each email</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='rate_limit.daily_limit'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Send Limit</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              placeholder='1000'
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1000)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of emails to send per day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex flex-row items-center justify-end gap-2 pt-3'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type='submit' form='broadcast-form' disabled={loading}>
            {loading && <Icon icon='mdi:loading' className='mr-2 h-4 w-4 animate-spin' />}
            {loading
              ? 'Processing...'
              : !form.watch('scheduled_time') || form.watch('scheduled_time')?.trim() === ''
                ? 'Send Now'
                : 'Schedule Send'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
