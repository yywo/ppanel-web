import { startOfMonth } from '@shadcn/ui/lib/date-fns';

export * from './countries';
export * from './formatting';
export * from './unit-conversions';

export const isBrowser = () => typeof window !== 'undefined';

export function getNextResetDate(startDate: Date | number) {
  let time = new Date(startDate);
  const resetDay = time.getDate();
  const currentDate = new Date();
  if (isNaN(time.getTime())) {
    throw new Error('Invalid start date');
  }
  if (currentDate.getDate() >= resetDay) {
    const startOfMonthNextReset = startOfMonth(currentDate);
    startOfMonthNextReset.setMonth(startOfMonthNextReset.getMonth() + 1);
    startOfMonthNextReset.setDate(resetDay);
    startOfMonthNextReset.setHours(time.getHours());
    startOfMonthNextReset.setMinutes(time.getMinutes());
    startOfMonthNextReset.setSeconds(time.getSeconds());
    return startOfMonthNextReset;
  } else {
    time.setMonth(currentDate.getMonth());
    return time;
  }
}

export function extractDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;

    if (hostname.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
      return hostname;
    }

    const domainParts = hostname.split('.').filter(Boolean);

    if (domainParts.length >= 2) {
      const topLevelDomain = domainParts.slice(-2).join('.');
      return topLevelDomain;
    }

    return hostname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}
