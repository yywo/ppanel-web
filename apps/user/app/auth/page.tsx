'use client';

import LanguageSwitch from '@/components/language-switch';
import ThemeSwitch from '@/components/theme-switch';
import useGlobalStore from '@/config/use-global';
import { oAuthLogin } from '@/services/common/oauth';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from '@workspace/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Icon } from '@workspace/ui/custom-components/icon';
import LoginLottie from '@workspace/ui/lotties/login.json';
import { useTranslations } from 'next-intl';
import Image from 'next/legacy/image';
import Link from 'next/link';
import EmailAuthForm from './email/auth-form';
import PhoneAuthForm from './phone/auth-form';

const icons = {
  apple: 'uil:apple',
  google: 'logos:google-icon',
  facebook: 'logos:facebook',
  github: 'uil:github',
  telegram: 'logos:telegram',
};

export default function Page() {
  const t = useTranslations('auth');
  const { common } = useGlobalStore();
  const { site, auth, oauth_methods } = common;

  const AUTH_COMPONENT_MAP = {
    email: <EmailAuthForm />,
    sms: <PhoneAuthForm />,
  } as const;

  type AuthMethod = keyof typeof AUTH_COMPONENT_MAP;

  const enabledAuthMethods = (Object.keys(AUTH_COMPONENT_MAP) as AuthMethod[]).filter((key) => {
    const value = auth[key];
    const enabledKey = `${key}_enabled` as const;

    if (typeof value !== 'object' || value === null) {
      return false;
    }

    if (!(enabledKey in value)) {
      return false;
    }
    const isEnabled = (value as unknown as Record<typeof enabledKey, boolean>)[enabledKey];
    return isEnabled;
  });
  return (
    <main className='bg-muted/50 flex h-full min-h-screen items-center'>
      <div className='flex size-full flex-auto flex-col lg:flex-row'>
        <div className='flex bg-cover bg-center lg:w-1/2 lg:flex-auto'>
          <div className='lg:py-15 md:px-15 flex w-full flex-col items-center justify-center px-5 py-7'>
            <Link className='mb-0 flex flex-col items-center lg:mb-12' href='/'>
              {site.site_logo && (
                <Image src={site.site_logo} height={48} width={48} alt='logo' unoptimized />
              )}
              <span className='text-2xl font-semibold'>{site.site_name}</span>
            </Link>
            <DotLottieReact
              data={LoginLottie}
              autoplay
              loop
              className='mx-auto hidden w-[275px] lg:block xl:w-[500px]'
            />
            <p className='hidden w-[275px] text-center md:w-1/2 lg:block xl:w-[500px]'>
              {site.site_desc}
            </p>
          </div>
        </div>
        <div className='flex flex-initial justify-center p-12 lg:flex-auto lg:justify-end'>
          <div className='lg:bg-background flex w-full flex-col items-center rounded-2xl md:w-[600px] md:p-10 lg:flex-auto lg:shadow'>
            <div className='flex w-full flex-col items-stretch justify-center md:w-[400px] lg:h-full'>
              <div className='flex flex-col justify-center lg:flex-auto'>
                <h1 className='mb-3 text-center text-2xl font-bold'>{t('verifyAccount')}</h1>
                <div className='text-muted-foreground mb-6 text-center font-medium'>
                  {t('verifyAccountDesc')}
                </div>
                {enabledAuthMethods.length === 1
                  ? AUTH_COMPONENT_MAP[enabledAuthMethods[0] as AuthMethod]
                  : enabledAuthMethods[0] && (
                      <Tabs defaultValue={enabledAuthMethods[0]}>
                        <TabsList className='mb-6 flex w-full *:flex-1'>
                          {enabledAuthMethods.map((method) => (
                            <TabsTrigger key={method} value={method}>
                              {t(`methods.${method}`)}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {enabledAuthMethods.map((method) => (
                          <TabsContent key={method} value={method}>
                            {AUTH_COMPONENT_MAP[method]}
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
              </div>
              <div className='py-8'>
                {oauth_methods?.length > 0 && (
                  <>
                    <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
                      <span className='bg-background text-muted-foreground relative z-10 px-2'>
                        Or continue with
                      </span>
                    </div>
                    <div className='mt-6 flex justify-center gap-4 *:size-12 *:p-2'>
                      {oauth_methods?.map((method: any) => {
                        return (
                          <Button
                            key={method}
                            variant='ghost'
                            size='icon'
                            asChild
                            onClick={async () => {
                              const { data } = await oAuthLogin({
                                method,
                                redirect: `${window.location.origin}/oauth/${method}`,
                              });
                              if (data.data?.redirect) {
                                window.location.href = data.data?.redirect;
                              }
                            }}
                          >
                            <Icon icon={icons[method as keyof typeof icons]} />
                          </Button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                  <LanguageSwitch />
                  <ThemeSwitch />
                </div>
                <div className='text-primary flex gap-5 text-sm font-semibold'>
                  <Link href='/tos'>{t('tos')}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
