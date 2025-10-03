import React, { Fragment, useState } from 'react';
import { Popover, Transition, PopoverButton, PopoverPanel, Menu } from '@headlessui/react';
import { AppUser, SystemInfo, SystemSummary } from '../types';
import { useAppContext } from '../context/ContextProvider';

import Avatar from './Avatar';
import Button from './Button';
import { PlusIcon } from 'lucide-react';

interface UserPopoverProps {
  children: React.ReactNode;
  popoverButton: React.ReactElement<any>;
}

const SimplePopover: React.FC<UserPopoverProps> = ({ children, popoverButton }) => {
  
  return (
    <>
      <Popover className="relative">

       {popoverButton} 

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel className="absolute -right-24 top-5 z-90 mt-3 w-72 bg-background overflow-hidden rounded-lg shadow-lg ring-1 ring-text ring-opacity-5 -translate-x-1/2 transform px-4 sm:px-0">
          <Menu>

            {children}

          </Menu>
          </PopoverPanel>
        </Transition>
      </Popover>
    </>
  );
};

export default SimplePopover;
