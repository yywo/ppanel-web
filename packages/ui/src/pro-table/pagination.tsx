import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Button } from '@shadcn/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select';
import { Table } from '@tanstack/react-table';

interface PaginationText {
  textRowsPerPage?: string;
  textPageOf?: (pageIndex: number, pageCount: number) => string;
}

interface PaginationProps<TData> {
  table: Table<TData>;
  text?: PaginationText;
}

export function Pagination<TData>({ table, text }: PaginationProps<TData>) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='text-muted-foreground flex-1 whitespace-nowrap'>
        {text?.textPageOf?.(table.getState().pagination.pageIndex + 1, table.getPageCount()) ||
          `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
      </div>
      <div className='flex items-center gap-2'>
        <div className='flex items-center space-x-2'>
          <p className='font-medium'>{text?.textRowsPerPage || 'Rows per page'}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 50, 100, 200].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant='outline'
          size='icon'
          className='hidden lg:flex'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Go to first page</span>
          <DoubleArrowLeftIcon className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Go to previous page</span>
          <ChevronLeftIcon className='h-4 w-4' />
        </Button>
        <Select
          value={`${table.getState().pagination.pageIndex + 1}`}
          onValueChange={(value) => table.setPageIndex(Number(value) - 1)}
        >
          <SelectTrigger className='w-[70px]'>
            <SelectValue placeholder='Select page number' />
          </SelectTrigger>
          <SelectContent className='w-12'>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <SelectItem key={i} value={`${i + 1}`}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='icon'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Go to next page</span>
          <ChevronRightIcon className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='hidden lg:flex'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Go to last page</span>
          <DoubleArrowRightIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
