'use client';

import { Invite } from './invite';
import { Register } from './register';
import { Verify } from './verify';

export default function Page() {
  return (
    <div className='space-y-3'>
      <Register />
      <Verify />
      <Invite />
    </div>
  );
}
