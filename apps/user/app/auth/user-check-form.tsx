import useGlobalStore from '@/config/use-global';
import { checkUser } from '@/services/common/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@workspace/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface UserCheckFormProps {
  loading?: boolean;
  onSubmit: (data: any) => Promise<void>;
  initialValues: any;
  setInitialValues: Dispatch<SetStateAction<any>>;
  setType: (type: 'login' | 'register' | 'reset') => void;
}

export default function UserCheckForm({
  loading,
  onSubmit,
  initialValues,
  setInitialValues,
  setType,
}: Readonly<UserCheckFormProps>) {
  const t = useTranslations('auth.check');
  const { common } = useGlobalStore();
  const { register } = common;

  const handleCheckUser = async (email: string) => {
    try {
      const response = await checkUser({ email });
      const exist = response.data.data?.exist;

      const newType = exist ? 'login' : 'register';
      const domain = email.split('@')[1];
      const isValid =
        exist ||
        !register.enable_email_verify ||
        register.email_domain_suffix_list.split('\n').includes(domain || '');

      setInitialValues({
        ...initialValues,
        email,
      });
      setType(newType);
      return !isValid;
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

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='grid gap-6'>
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting || loading}>
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
