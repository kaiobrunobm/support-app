import React from 'react'
import { useAppContext } from '../../../utils/ContextProvider';
import Hardware from '../dashboard/sections/Hardware';
import Network from '../dashboard/sections/Network';
import OperatingSystems from '../dashboard/sections/OperatingSystems';
import Printers from './sections/Printers';
import { ChatIcon, ChatsIcon, CircleNotchIcon } from '@phosphor-icons/react';


const Dashboard: React.FC = () => {
  const { systemInfo, user } = useAppContext();

  console.log(systemInfo)
  {
    if (!systemInfo) {
      return (
        <section className='bg-background text-text h-full w-screen flex flex-col justify-center items-center mt-10 '>
          <CircleNotchIcon size={40} weight='bold' className='animate-spin' />
        </section>
      )
    }

  }

  return (
    <section className='bg-background text-text h-full flex flex-col items-start'>
      {user && <div className='fixed bottom-12 right-12 h-16 w-16 rounded-full bg-border flex items-center justify-center transition-all duration-150 ease-in-out cursor-pointer hover:bg-border/50'><ChatsIcon size={24} weight='fill' className='text-text'/></div>}
      <div className='px-3 py-1.5'>
        <h1 className='text-3xl font-bold'>Visão geral</h1>
        <span className='uppercase font-light flex items-center gap-2'>{systemInfo.domain} - <div className='lowercase'>{systemInfo.uptime}</div> </span>
      </div>

      <OperatingSystems system={systemInfo.distro} version={systemInfo.release || 'Nenhuma versão encontrada'} arch={systemInfo?.arch} kernel={systemInfo?.kernel} />
      <Hardware cpu={`${systemInfo.hardware.cpu.model}`} ram={`${systemInfo.hardware.memory.map(memory => memory.size).reduce((a, b) => a + b, 0)}gb`} storage={systemInfo?.disks} />
      <Network adapter={systemInfo.network.adapters.filter(adapter => adapter.ip.startsWith('192') || adapter.ip.startsWith('10'))} publicIp={systemInfo?.network.publicIP} />
      <Printers printers={systemInfo.printers} />
    </section >
  )
}

export default Dashboard
