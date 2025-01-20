import { locales, NEXT_PUBLIC_DEFAULT_LANGUAGE } from '@/config/constants';
import { isBrowser } from '@workspace/ui/utils';
import { UAParser } from 'ua-parser-js';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, {
  path: '/',
  maxAge: 365 * 24 * 60 * 60,
});

export function getLocale() {
  const browserLocale = navigator.language?.split(',')?.[0] || '';
  const defaultLocale = locales.includes(browserLocale) ? browserLocale : '';
  const cookies = new Cookies(null, { path: '/' });
  const cookieLocale = cookies.get('locale') || '';
  const locale = cookieLocale || defaultLocale || NEXT_PUBLIC_DEFAULT_LANGUAGE;
  return locale;
}

export function setLocale(value: string) {
  return cookies.set('locale', value);
}

export function setAuthorization(value: string) {
  return cookies.set('Authorization', value);
}

export function getAuthorization(value?: string) {
  const Authorization = isBrowser() ? cookies.get('Authorization') : value;
  if (!Authorization) return;
  return Authorization;
}

export function setRedirectUrl(value?: string) {
  if (value) {
    sessionStorage.setItem('redirect-url', value);
  }
}

export function getRedirectUrl() {
  return sessionStorage.getItem('redirect-url') ?? '/dashboard';
}

export function Logout() {
  if (!isBrowser()) return;
  cookies.remove('Authorization');
  const pathname = location.pathname;
  if (!['', '/', '/auth', '/tos', '/oauth'].includes(pathname)) {
    setRedirectUrl(location.pathname);
    location.href = `/auth`;
  }
}

export function getPlatform(): 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'harmony' {
  const parser = new UAParser();
  const os = parser.getOS();
  const osName = os.name?.toLowerCase() || '';

  if (osName.includes('windows')) return 'windows';
  if (osName.includes('mac')) return 'mac';
  if (
    osName.includes('linux') ||
    osName.includes('ubuntu') ||
    osName.includes('debian') ||
    osName.includes('fedora') ||
    osName.includes('red hat') ||
    osName.includes('centos') ||
    osName.includes('arch')
  )
    return 'linux';
  if (osName.includes('android')) return 'android';
  if (osName.includes('ios')) return 'ios';
  if (osName.includes('harmony')) return 'harmony';

  return 'windows';
}
