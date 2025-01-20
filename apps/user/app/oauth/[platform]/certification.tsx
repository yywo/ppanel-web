'use client';

import {
  appleLoginCallback,
  facebookLoginCallback,
  googleLoginCallback,
  telegramLoginCallback,
} from '@/services/common/oauth';
import { getRedirectUrl, setAuthorization } from '@/utils/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface CertificationProps {
  platform: string;
  children: React.ReactNode;
}

export default function Certification({ platform, children }: CertificationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  async function LoginCallback() {
    const body = Object.fromEntries(searchParams.entries()) as any;
    switch (platform) {
      case 'apple':
        return appleLoginCallback(body);
      case 'facebook':
        return facebookLoginCallback(body);
      case 'google':
        return googleLoginCallback(body);
      case 'telegram':
        return telegramLoginCallback(body);
      default:
        break;
    }
  }
  useEffect(() => {
    LoginCallback()
      .then((res) => {
        const token = res?.data?.data?.token;
        setAuthorization(token);
        router.replace(getRedirectUrl());
        router.refresh();
      })
      .catch((error) => {
        router.replace('/auth');
      });
  }, [platform, searchParams.values()]);

  return children;
}
