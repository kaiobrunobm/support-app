import { CpuIcon, DesktopTowerIcon, SidebarSimpleIcon, SignOutIcon, UsersIcon, WifiHighIcon } from '@phosphor-icons/react';
import React, { useState } from 'react'
import { Link } from 'react-router'
import { useAppContext } from '../../utils/ContextProvider';
import Hardware from './sections/Hardware';
import Network from './sections/Network';
import OperatingSystems from './sections/OperatingSystems';
import { motion, AnimatePresence } from 'framer-motion'
import NavItem from './components/NavItem';

const Dashboard: React.FC = () => {
  const [navOpen, setNavOpen] = useState(true)
  const systemInfo = useAppContext();

  return (
    <section className='bg-background text-text h-full flex flex-col items-start lg:h-screen'>
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/40 "
              onClick={() => setNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-background px-5 py-2.5 flex flex-col gap-2.5 z-50 md:w-96"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <button onClick={() => setNavOpen(!navOpen)} className='p-2 bg-border rounded-full absolute -right-2 '>
                <SidebarSimpleIcon size={24} weight='fill' />
              </button>
              <h2 className="text-lg font-bold px-4 py-2.5 ">Support app</h2>
              <div className='flex flex-col gap-2.5 py-4'>
                <NavItem icon={<DesktopTowerIcon size={24} weight='fill' />} navText="Visão geral" path='/dashboard' active />
                <NavItem icon={<CpuIcon size={24} />} navText="Visão geral" path='/dashboard' />
                <NavItem icon={<WifiHighIcon size={24} />} navText="Internet" path='/dashboard' />
                <NavItem icon={<UsersIcon size={24} />} navText="Usuários" path='/dashboard' />
              </div>
            </motion.div>

          </>
        )}
      </AnimatePresence>
      <header className='bg-background/50 backdrop-blur-md flex justify-between items-center self-stretch px-4 py-4 border-b border-border sticky top-0'>
        <button onClick={() => setNavOpen(!navOpen)} className='p-2 bg-border rounded-full '>
          <SidebarSimpleIcon size={24} />
        </button>
        <Link to="/">
          <SignOutIcon size={24} weight="fill" className='transition-all duration-150 ease-in-out hover:text-error cursor-pointer' />
        </Link>
      </header>
      <div className='flex flex-col items-start self-stretch gap-2.5 p-2.5'>
        <div className='px-3 py-1.5'>
          <h1 className='text-3xl font-bold'>Visão geral</h1>
          <span className='uppercase font-light'>{systemInfo?.domain}</span>
        </div>

        <OperatingSystems system={systemInfo?.distro} version={systemInfo?.build || 'Nenhuma versão encontrada'} arch={systemInfo?.arch} kernel={systemInfo?.kernel} />
        <Hardware cpu={`${systemInfo?.hardware.cpu.model}`} ram={`${systemInfo?.hardware.memory.map(memory => memory.size.toFixed(0))}gb`} storage={systemInfo?.disks} />
        <Network adapter={systemInfo?.network.adapters.filter(adapter => adapter.ip.startsWith('192' || '10')) || null} publicIp={systemInfo?.network.publicIP} />
      </div>
      <div>
      </div>
    </section>
  )
}

export default Dashboard
