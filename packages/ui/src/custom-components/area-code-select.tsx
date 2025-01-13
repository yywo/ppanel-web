import { Icon } from '@iconify/react';
import { Combobox } from '@workspace/ui/custom-components/combobox';
import { cn } from '@workspace/ui/lib/utils';
import { countries, type ICountry } from '@workspace/ui/utils/countries';
import { useEffect, useState } from 'react';

interface AreaCodeSelectProps {
  value?: string; // phone number
  onChange?: (value: ICountry) => void;
  className?: string;
  placeholder?: string;
}

const items = countries
  .filter((item) => !!item.phone)
  .map((item) => {
    const phones = item.phone!.split(',');
    if (phones.length > 1) {
      return [...phones].map((phone) => ({
        ...item,
        phone,
      }));
    }
    return item;
  })
  .flat();

export const AreaCodeSelect = ({
  value,
  onChange,
  className,
  placeholder = 'Select Area Code',
}: AreaCodeSelectProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    const index = items.findIndex((item) => item.phone === value);
    setSelectedIndex(index);
  }, [value]);

  return (
    <Combobox
      placeholder={placeholder}
      className={cn('min-w-fit', className)}
      options={items.map((item, index) => ({
        label: `+${item.phone} (${item.name})`,
        value: index,
        children: (
          <div className='flex items-center gap-2'>
            <Icon icon={`flagpack:${item.alpha2.toLowerCase()}`} className='!size-5' />+{item.phone}{' '}
            ({item.name})
          </div>
        ),
      }))}
      value={selectedIndex >= 0 ? selectedIndex : undefined}
      onChange={(index) => {
        if (typeof index !== 'number') return;
        setSelectedIndex(index);
        if (items[index]) onChange?.(items[index]);
      }}
    />
  );
};
