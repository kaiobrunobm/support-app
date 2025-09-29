import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate } from 'react-router';
import { useAppContext } from '../context/ContextProvider';
import SystemSearch from '../components/SystemSearch';
import NavItem from '../components/NavItem';
import Avatar from '../components/Avatar';
import {
  CpuIcon,
  DesktopTowerIcon,
  SidebarSimpleIcon,
  WifiHighIcon,
  SignOutIcon,
  UsersThreeIcon,
  HeadsetIcon,
  ListBulletsIcon, 
} from '@phosphor-icons/react';

const MainLayout: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { logout, user } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const isAdminOrIT = user?.role === 'ADMIN' || user?.role === 'IT_SUPPORT';

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/40"
              onClick={() => setNavOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed top-0 left-0 z-50 flex h-full w-72 flex-col gap-2.5 bg-background px-5 py-2.5 text-text"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="px-4 py-2.5 text-lg font-bold">SystemPulse</h2>
                <button
                  onClick={() => setNavOpen(false)}
                  className="rounded-full bg-border p-2"
                >
                  <SidebarSimpleIcon size={24} weight="fill" />
                </button>
              </div>

              <nav className="flex flex-col gap-2.5 py-4">
                <NavItem setNavOpen={setNavOpen} navOpen={navOpen} icon={<DesktopTowerIcon size={24} />} navText="Visão Geral" path="/app/dashboard" end />
                <NavItem setNavOpen={setNavOpen} navOpen={navOpen} icon={<CpuIcon size={24} />} navText="Hardware" path="/app/hardware" />
                <NavItem setNavOpen={setNavOpen} navOpen={navOpen} icon={<WifiHighIcon size={24} />} navText="Internet" path="/app/network" />

                {isAdminOrIT && (
                  <>
                    <div className="my-2 border-t border-border"></div>
                    <NavItem setNavOpen={setNavOpen} navOpen={navOpen} icon={<ListBulletsIcon size={24} />} navText="Sistemas" path="/app/systems" />
                    <NavItem setNavOpen={setNavOpen} navOpen={navOpen} icon={<HeadsetIcon size={24} />} navText="Chamados" path="/app/tickets" />
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/50 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setNavOpen(true)} className="rounded-full bg-border p-2">
            <SidebarSimpleIcon size={24} />
          </button>
          {user?.role === 'ADMIN' && <SystemSearch />}
        </div>
        <div className="flex items-center gap-4">
            {user && <Avatar avatarUrl={user.avatarUrl} />}
            <button onClick={handleLogout}>
              <SignOutIcon size={24} weight="fill" className="cursor-pointer text-text transition-all duration-150 ease-in-out hover:text-error" />
            </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-x-clip">
        <div className="flex flex-col items-start gap-2.5 p-6">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

