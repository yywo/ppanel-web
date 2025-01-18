'use client';

import { icons as FlagPack } from '@iconify-json/flagpack';
import { icons as Mdi } from '@iconify-json/mdi';
import { icons as Simple } from '@iconify-json/simple-icons';
import { icons as Uil } from '@iconify-json/uil';

import { addCollection, Icon as Iconify, IconProps } from '@iconify/react';

addCollection(FlagPack);
addCollection(Mdi);
addCollection(Uil);
addCollection(Simple);

export function Icon(props: IconProps) {
  return <Iconify {...props} />;
}
