import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NavItem from '../components/NavItem'
import {
  CpuIcon, DesktopTowerIcon, SidebarSimpleIcon, UsersIcon, WifiHighIcon, SignOutIcon
} from '@phosphor-icons/react';
import { Outlet, Link, useLocation } from 'react-router'

const Sidebar: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false)
  const lacation = useLocation()

  return (
    <>
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/40 "
              onClick={() => setNavOpen(!navOpen)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-background text-text px-5 py-2.5 flex flex-col gap-2.5 z-50 md:w-96"
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
                <NavItem setNavOpen={setNavOpen} navOpen icon={<DesktopTowerIcon size={24} weight={location.pathname === '/dashboard' ? 'fill' : 'regular'} />} navText="Visão geral" path='/dashboard' active={location.pathname === '/dashboard'} />
                <NavItem setNavOpen={setNavOpen} navOpen icon={<CpuIcon size={24} weight={location.pathname === '/dashboard/hardware' ? 'fill' : 'regular'} />} navText="Hardware" path='/dashboard/hardware' active={location.pathname === '/dashboard/hardware'} />
                <NavItem setNavOpen={setNavOpen} navOpen icon={<WifiHighIcon size={24} weight={location.pathname === '/dashboard/network' ? 'fill' : 'regular'} />} navText="Internet" path='/dashboard' active={location.pathname === '/dashboard/network'} />
                <NavItem setNavOpen={setNavOpen} navOpen icon={<UsersIcon size={24} weight={location.pathname === '/dashboard/users' ? 'fill' : 'regular'} />} navText="Usuários" path='/dashboard' active={location.pathname === '/dashboard/users'} />
              </div>
            </motion.div>

          </>
        )}
      </AnimatePresence>

      <header className='bg-background/50 text-text backdrop-blur-md flex justify-between items-center self-stretch px-4 py-4 border-b border-border sticky top-0 z-40'>
        <button onClick={() => setNavOpen(!navOpen)} className='p-2 bg-border rounded-full '>
          <SidebarSimpleIcon size={24} />
        </button>
        <Link to="/">
          <SignOutIcon size={24} weight="fill" className='transition-all duration-150 ease-in-out hover:text-error cursor-pointer' />
        </Link>
      </header>
      <div className='flex flex-col items-start gap-2.5 py-2.5 px-6 overflow-x-clip'>
        <Outlet />
      </div>
    </>

  )
}

export default Sidebar
