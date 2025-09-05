'use client';

import { Button } from '@workspace/ui/components/button';
import { Command, CommandInput, CommandItem, CommandList } from '@workspace/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { useMemo, useState } from 'react';

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

function getAllTimezones(): TimezoneOption[] {
  try {
    const timeZones = Intl.supportedValuesOf('timeZone');

    return [
      {
        value: 'UTC',
        label: 'UTC',
        offset: '+00:00',
      },
    ].concat(
      timeZones
        .map((tz) => {
          const parts = tz.split('/');
          let label = tz;

          if (parts.length >= 2) {
            const region = parts[0];
            const city = parts[1]?.replace(/_/g, ' ') || '';
            label = `${city} (${region})`;
          }

          return {
            value: tz,
            label: label,
            offset: getTimezoneOffset(tz),
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    );
  } catch {
    return [
      {
        value: 'UTC',
        label: 'UTC',
        offset: '+00:00',
      },
    ];
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
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return '+00:00';
  }
}

export default function TimezoneSwitch() {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [open, setOpen] = useState(false);

  const timezoneOptions = useMemo(() => getAllTimezones(), []);

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
            {timezoneOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={`${option.label} ${option.value}`}
                onSelect={() => handleTimezoneChange(option.value)}
              >
                <div className='flex w-full items-center gap-3'>
                  <div className='flex flex-1 flex-col'>
                    <span className='font-medium'>{option.label}</span>
                    <span className='text-muted-foreground text-xs'>
                      {option.value} • {option.offset}
                    </span>
                  </div>
                  <Icon
                    icon='uil:check'
                    className={cn(
                      'h-4 w-4',
                      timezone === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
