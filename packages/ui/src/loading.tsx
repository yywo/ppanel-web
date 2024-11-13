import { BorderBeam } from '@shadcn/ui/border-beam';
import Ripple from '@shadcn/ui/ripple';
import { LoadingIcon } from './lotties';

export function Loading() {
  return (
    <div className='relative flex size-full items-end justify-center overflow-hidden'>
      <BorderBeam />
      <Ripple />
      <LoadingIcon className='my-24 w-64' />
    </div>
  );
}
