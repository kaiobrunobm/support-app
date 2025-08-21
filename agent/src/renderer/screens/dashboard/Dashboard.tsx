import React from 'react'
import { useAppContext } from '../../../utils/ContextProvider';
import Hardware from '../dashboard/sections/Hardware';
import Network from '../dashboard/sections/Network';
import OperatingSystems from '../dashboard/sections/OperatingSystems';

const Dashboard: React.FC = () => {
  const systemInfo = useAppContext();

  {
    if (!systemInfo) {
      return (
        <section className='bg-background text-text h-full flex flex-col justify-center items-center lg:h-screen'>
        </section>
      )
    }

  }
  return (
    <section className='bg-background text-text h-full flex flex-col items-start lg:h-screen'>

      <div className='px-3 py-1.5'>
        <h1 className='text-3xl font-bold'>Visão geral</h1>
        <span className='uppercase font-light flex items-center gap-2'>{systemInfo.domain} - <div className='lowercase'>{systemInfo.uptime}</div> </span>
      </div>

      <OperatingSystems system={systemInfo.distro} version={systemInfo.release || 'Nenhuma versão encontrada'} arch={systemInfo?.arch} kernel={systemInfo?.kernel} />
      <Hardware cpu={`${systemInfo.hardware.cpu.model}`} ram={`${systemInfo.hardware.memory.map(memory => memory.size.toFixed(0))}gb`} storage={systemInfo?.disks} />
      <Network adapter={systemInfo.network.adapters.filter(adapter => adapter.ip.startsWith('192') || adapter.ip.startsWith('10')) || null} publicIp={systemInfo?.network.publicIP} />
    </section >
  )
}

export default Dashboard
