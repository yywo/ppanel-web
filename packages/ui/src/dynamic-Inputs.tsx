import { Button } from '@shadcn/ui/button';
import { CircleMinusIcon, CirclePlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Combobox } from './combobox';
import { EnhancedInput } from './enhanced-input';

interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  options?: { label: string; value: string }[];
}

interface ObjectInputProps<T> {
  value: T;
  onChange: (value: T) => void;
  fields: FieldConfig[];
}

export function ObjectInput<T extends Record<string, any>>({
  value,
  onChange,
  fields,
}: ObjectInputProps<T>) {
  const updateField = (key: keyof T, fieldValue: string | number) => {
    onChange({ ...value, [key]: fieldValue });
  };

  return (
    <div className='flex flex-1 gap-4'>
      {fields.map(({ name, type, options, ...fieldProps }) => (
        <div key={name} className='flex-1'>
          {type === 'select' && options ? (
            <Combobox<string, false>
              placeholder={fieldProps.placeholder}
              options={options}
              value={value[name]}
              onChange={(fieldValue) => {
                updateField(name, fieldValue);
              }}
            />
          ) : (
            <EnhancedInput
              value={value[name]}
              onValueChange={(fieldValue) => updateField(name, fieldValue)}
              type={type}
              {...fieldProps}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface ArrayInputProps<T> {
  value?: T[];
  onChange: (value: T[]) => void;
  fields: FieldConfig[];
}

export function ArrayInput<T extends Record<string, any>>({
  value = [],
  onChange,
  fields,
}: ArrayInputProps<T>) {
  const initializeDefaultItem = (): T =>
    fields.reduce((acc, field) => {
      acc[field.name as keyof T] = undefined as T[keyof T];
      return acc;
    }, {} as T);

  const [displayItems, setDisplayItems] = useState<T[]>(() => {
    return value.length > 0 ? value : [initializeDefaultItem()];
  });

  const isItemModified = (item: T): boolean =>
    fields.some((field) => {
      const val = item[field.name];
      return val !== undefined && val !== null && val !== '';
    });

  const handleItemChange = (index: number, updatedItem: T) => {
    const newDisplayItems = [...displayItems];
    newDisplayItems[index] = updatedItem;
    setDisplayItems(newDisplayItems);

    const modifiedItems = newDisplayItems.filter(isItemModified);
    onChange(modifiedItems);
  };

  const createField = () => {
    setDisplayItems([...displayItems, initializeDefaultItem()]);
  };

  const deleteField = (index: number) => {
    const newDisplayItems = displayItems.filter((_, i) => i !== index);
    setDisplayItems(newDisplayItems);

    const modifiedItems = newDisplayItems.filter(isItemModified);
    onChange(modifiedItems);
  };

  return (
    <div className='flex flex-col gap-4'>
      {displayItems.map((item, index) => (
        <div key={index} className='flex items-center gap-4'>
          <ObjectInput
            value={item}
            onChange={(updatedItem) => handleItemChange(index, updatedItem)}
            fields={fields}
          />
          <div className='flex min-w-20 items-center'>
            {displayItems.length > 1 && (
              <Button
                variant='ghost'
                size='icon'
                type='button'
                className='text-destructive p-0 text-lg'
                onClick={() => deleteField(index)}
              >
                <CircleMinusIcon />
              </Button>
            )}
            {index === displayItems.length - 1 && (
              <Button
                variant='ghost'
                size='icon'
                type='button'
                className='text-primary p-0 text-lg'
                onClick={createField}
              >
                <CirclePlusIcon />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
