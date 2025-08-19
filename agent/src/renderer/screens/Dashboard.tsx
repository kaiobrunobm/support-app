import { SidebarSimpleIcon, SignOutIcon } from '@phosphor-icons/react';
import React from 'react'
import { Link } from 'react-router'
import { useAppContext } from '../../utils/ContextProvider';
import OperatingSystems from './sections/OperatingSystems';

const Dashboard: React.FC = () => {
  const systemInfo = useAppContext();


  return (
    <section className='bg-background text-text h-screen flex flex-col items-start'>
      <header className='flex justify-between items-center self-stretch px-4 py-2.5 border-b border-border'>
        <button className='p-2 bg-border rounded-full'>
          <SidebarSimpleIcon size={24} />
        </button>
        <Link to="/">
          <SignOutIcon size={24} weight="fill" className='transition-all duration-150 ease-in-out hover:text-error cursor-pointer' />
        </Link>
      </header>
      <div className='flex flex-col items-start gap-2.5 p-2.5'>
        <div className='px-3 py-1.5'>
          <h1 className='text-3xl font-bold'>Visão geral</h1>
          <span className='uppercase font-light'>{systemInfo?.domain}</span>
        </div>

        <OperatingSystems />
      </div>
      <div>
      </div>
    </section>
  )
}

export default Dashboard
