'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

interface TimezoneOption {
  value: string;
  label: string;
  timezone: string;
}

function getCurrentTime(timezone: string): string {
  try {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function getAllTimezones(locale: string = 'en-US'): TimezoneOption[] {
  try {
    const timeZones = Intl.supportedValuesOf('timeZone');

    const processed = timeZones
      .map((tz) => {
        try {
          return {
            value: tz,
            label: tz,
            timezone: getTimezoneOffset(tz),
          };
        } catch {
          return {
            value: tz,
            label: tz,
            timezone: 'UTC+00:00',
          };
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label, locale));

    const hasUTC = processed.some((tz) => tz.value === 'UTC');
    if (!hasUTC) {
      processed.unshift({
        value: 'UTC',
        label: 'UTC',
        timezone: 'UTC+00:00',
      });
    }

    return processed;
  } catch {
    return [
      {
        value: 'UTC',
        label: 'UTC',
        timezone: 'UTC+00:00',
      },
    ];
  }
}

function getServerTimezones(): string[] {
  return ['UTC'];
}

function getRecommendedTimezones(): string[] {
  try {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimezone.startsWith('Asia/')) {
      return ['Asia/Shanghai', 'Asia/Tokyo', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Seoul'];
    } else if (browserTimezone.startsWith('Europe/')) {
      return ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid'];
    } else if (browserTimezone.startsWith('America/')) {
      return [
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'America/Denver',
        'America/Toronto',
      ];
    } else if (browserTimezone.startsWith('Australia/')) {
      return ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Brisbane'];
    } else {
      return [
        'America/New_York',
        'Europe/London',
        'Asia/Shanghai',
        'Asia/Tokyo',
        'Australia/Sydney',
      ];
    }
  } catch {
    return ['America/New_York', 'Europe/London', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney'];
  }
}

function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();

    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.floor((Math.abs(offset) - hours) * 60);

    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return 'UTC+00:00';
  }
}

export default function TimezoneSwitch() {
  const locale = useLocale();
  const [timezone, setTimezone] = useState<string>('UTC');
  const [open, setOpen] = useState(false);

  const timezoneOptions = useMemo(() => getAllTimezones(locale), [locale]);

  useEffect(() => {
    const savedTimezone = localStorage.getItem('timezone');
    if (savedTimezone) {
      setTimezone(savedTimezone);
    } else {
      try {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(browserTimezone);
        localStorage.setItem('timezone', browserTimezone);
      } catch {
        setTimezone('UTC');
      }
    }
  }, []);

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    localStorage.setItem('timezone', newTimezone);
    setOpen(false);

    window.dispatchEvent(
      new CustomEvent('timezoneChanged', {
        detail: { timezone: newTimezone },
      }),
    );
  };
  const serverTimezones = timezoneOptions.filter(
    (option) => getServerTimezones().includes(option.value) && option.value !== timezone,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='p-0'>
          <Icon icon='flat-color-icons:overtime' className='!size-6' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end'>
        <Command>
          <CommandInput placeholder='Search...' />
          <CommandList>
            <CommandGroup heading='Current'>
              {timezoneOptions
                .filter((option) => option.value === timezone)
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleTimezoneChange(option.value)}
                    className='bg-primary/10'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <div className='flex flex-1 flex-col'>
                        <span className='font-medium'>{option.value}</span>
                        <span className='text-muted-foreground text-xs'>
                          {option.timezone} • {getCurrentTime(option.value)}
                        </span>
                      </div>
                      <Icon icon='uil:check' className='h-4 w-4 opacity-100' />
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            {serverTimezones.length > 0 && (
              <CommandGroup heading='Server'>
                {serverTimezones.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleTimezoneChange(option.value)}
                  >
                    <div className='flex w-full items-center gap-3'>
                      <div className='flex flex-1 flex-col'>
                        <span className='font-medium'>{option.value}</span>
                        <span className='text-muted-foreground text-xs'>
                          {option.timezone} • {getCurrentTime(option.value)}
                        </span>
                      </div>
                      <Icon icon='uil:check' className='h-4 w-4 opacity-0' />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading='Recommended'>
              {timezoneOptions
                .filter(
                  (option) =>
                    getRecommendedTimezones().includes(option.value) && option.value !== timezone,
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleTimezoneChange(option.value)}
                  >
                    <div className='flex w-full items-center gap-3'>
                      <div className='flex flex-1 flex-col'>
                        <span className='font-medium'>{option.value}</span>
                        <span className='text-muted-foreground text-xs'>
                          {option.timezone} • {getCurrentTime(option.value)}
                        </span>
                      </div>
                      <Icon icon='uil:check' className='h-4 w-4 opacity-0' />
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>

            <CommandGroup heading='All'>
              {timezoneOptions
                .filter(
                  (option) =>
                    !getServerTimezones().includes(option.value) &&
                    !getRecommendedTimezones().includes(option.value) &&
                    option.value !== timezone,
                )
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={() => handleTimezoneChange(option.value)}
                  >
                    <div className='flex w-full items-center gap-3'>
                      <div className='flex flex-1 flex-col'>
                        <span className='font-medium'>{option.value}</span>
                        <span className='text-muted-foreground text-xs'>
                          {option.timezone} • {getCurrentTime(option.value)}
                        </span>
                      </div>
                      <Icon icon='uil:check' className='h-4 w-4 opacity-0' />
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
