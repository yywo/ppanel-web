'use client';

import { Table } from '@tanstack/react-table';
import { Input } from '@workspace/ui/components/input';
import { Combobox } from '@workspace/ui/custom-components/combobox';

export interface IParams {
  key: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  type?: 'text' | 'select' | 'date';
}
interface ColumnFilterProps<TData> {
  table: Table<TData>;
  params: IParams[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any;
}

export function ColumnFilter<TData>({ table, params, filters }: ColumnFilterProps<TData>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: string, value: any) => {
    table.setColumnFilters((prev) => {
      const newFilters = prev.filter((filter) => filter.id !== key);
      if (value) {
        newFilters.push({ id: key, value });
      }
      return newFilters;
    });
  };

  const toDateInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${MM}-${dd}`;
  };

  return (
    <div className='flex gap-2'>
      {params.map((param) => {
        if (param.options || param.type === 'select') {
          return (
            <Combobox
              key={param.key}
              className='w-32'
              placeholder={param.placeholder || 'Choose...'}
              value={filters[param.key] || ''}
              onChange={(value) => {
                updateFilter(param.key, value);
              }}
              options={param.options}
            />
          );
        }
        if (param.type === 'date') {
          const raw = filters[param.key];
          const inputValue =
            typeof raw === 'number'
              ? toDateInput(new Date(raw))
              : typeof raw === 'string'
                ? raw
                : '';
          return (
            <Input
              key={param.key}
              className='block w-32'
              type='date'
              placeholder={param.placeholder}
              value={inputValue}
              onChange={(event) => {
                const v = event.target.value;
                updateFilter(param.key, v || '');
              }}
            />
          );
        }
        return (
          <Input
            key={param.key}
            className='w-32'
            placeholder={param.placeholder || 'Search...'}
            value={filters[param.key] || ''}
            onChange={(event) => updateFilter(param.key, event.target.value)}
          />
        );
      })}
    </div>
  );
}
