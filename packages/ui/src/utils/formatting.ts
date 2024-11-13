import { intlFormat } from '@shadcn/ui/lib/date-fns';

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1000, // or 1024
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

export function formatDate(date?: Date | number, showTime: boolean = true) {
  if (!date) return;
  return intlFormat(date, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    ...(showTime && {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }),
    hour12: false,
  });
}
