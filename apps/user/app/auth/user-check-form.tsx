import useGlobalStore from '@/config/use-global';
import { checkUser } from '@/services/common/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@workspace/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface UserCheckFormProps {
  loading?: boolean;
  onSubmit: (data: any) => void;
  initialValues: any;
  type?: 'login' | 'register' | 'reset';
  setType: (type: 'login' | 'register' | 'reset') => void;
}

export default function UserCheckForm({
  loading,
  onSubmit,
  initialValues,
  type,
  setType,
}: Readonly<UserCheckFormProps>) {
  const t = useTranslations('auth.check');
  const { common } = useGlobalStore();
  const { register } = common;

  const handleCheckUser = async (email: string) => {
    try {
      const response = await checkUser({ email });
      const exist = response.data.data?.exist;

      if (exist) {
        setType('login');
        return true;
      }

      if (!register.enable_email_domain_suffix) {
        setType('register');
        return true;
      }

      const domain = email.split('@')[1];
      const isValid = register.email_domain_suffix_list.split('\n').includes(domain || '');

      if (isValid) {
        setType('register');
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error checking user:', error);
      return false;
    }
  };

  const formSchema = z.object({
    email: z
      .string()
      .email(t('email'))
      .refine(handleCheckUser, {
        message: t('whitelist'),
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEmailChange = async (value: string) => {
    form.setValue('email', value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      const isValid = await form.trigger('email');
      if (isValid) {
        setIsSubmitting(true);
        form.handleSubmit(onSubmit)();
      } else {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  useEffect(() => {
    if (initialValues?.email) {
      handleEmailChange(initialValues.email);
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder='Enter your email...'
                  type='email'
                  {...field}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={!isSubmitting}>
          {isSubmitting ? (
            <>
              <Icon icon='mdi:loading' className='mr-2 size-5 animate-spin' />
              {t('checking')}
            </>
          ) : (
            t('continue')
          )}
        </Button>
      </form>
    </Form>
  );
}
