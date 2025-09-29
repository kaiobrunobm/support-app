import React from 'react'
import { useAppContext } from '../../../utils/ContextProvider';
import Hardware from '../dashboard/sections/Hardware';
import Network from '../dashboard/sections/Network';
import OperatingSystems from '../dashboard/sections/OperatingSystems';
import Printers from './sections/Printers';
import { ChatsIcon, CircleNotchIcon, PlusIcon, UserIcon } from '@phosphor-icons/react';
import anydeskIcon from '/anydesk-icon.png'
import Avatar from '../components/Avatar';


const Dashboard: React.FC = () => {
  const { systemInfo, user } = useAppContext();

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
      <div className='w-full flex justify-between items-center px-3 py-1.5'>
        <div>
        <h1 className='text-3xl font-bold'>Visão geral</h1>
        <span className='uppercase font-light flex items-center gap-2'>{systemInfo.domain} - <div className='lowercase'>{systemInfo.uptime}</div> </span>
        </div>
        <div className='flex flex-col items-end gap-2.5'>
          
         
            {systemInfo.user ? 
              <Avatar {...systemInfo.user} /> 
              :
              <div className='flex items-center gap-2.5 cursor-pointer'>
                Adicionar usuário
                <PlusIcon size={20}/>
                </div>
            }

            {systemInfo.anydesk ? 
              <div className='flex items-center gap-2.5 font-bold text-[#ED3A47] cursor-pointer'>
                <img src={anydeskIcon} alt="anydesk icon"/>
                <p>{systemInfo.anydesk}</p>
              </div>
              :
              <div className='flex items-center gap-2.5 font-bold text-[#ED3A47] cursor-pointer'>
                Adicionar anydesk
                <PlusIcon size={20} weight='bold'/>
                </div>
            }
            
          
        </div>
      </div>

      <OperatingSystems system={systemInfo.distro} version={systemInfo.release || 'Nenhuma versão encontrada'} arch={systemInfo?.arch} kernel={systemInfo?.kernel} />
      <Hardware cpu={`${systemInfo.hardware.cpu.model}`} ram={`${systemInfo.hardware.memory.map(memory => memory.size).reduce((a, b) => a + b, 0)}gb`} storage={systemInfo?.disks} />
      <Network adapter={systemInfo.network.adapters.filter(adapter => adapter.ip.startsWith('192') || adapter.ip.startsWith('10'))} publicIp={systemInfo?.network.publicIP} />
      <Printers printers={systemInfo.printers} />
    </section >
  )
}

export default Dashboard
