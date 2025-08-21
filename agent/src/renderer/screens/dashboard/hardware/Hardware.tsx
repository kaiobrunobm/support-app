import { useAppContext } from '../../../../utils/ContextProvider';
import React from 'react'
import Cpu from './sections/Cpu'
import Ram from './sections/Ram';
import { size } from 'zod';

const HardwareScreen: React.FC = () => {
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
        <h1 className='text-3xl font-bold'>Hardware</h1>
      </div>
      <Cpu manufacturer={systemInfo.hardware.cpu.manufacturer} model={systemInfo.hardware.cpu.model} cores={systemInfo.hardware.cpu.cores} clockSpeed={systemInfo.hardware.cpu.speed} socket={systemInfo.hardware.cpu.socket ? systemInfo.hardware.cpu.socket : 'Socket não identificado'} />
      <Ram size={systemInfo.hardware.memory[0].size} used={systemInfo.hardware.memory[0].size / 2} type={systemInfo.hardware.memory[0].type} clockSpeed={systemInfo.hardware.memory[0].clockSpeed} />

    </section >

  )
}

export default HardwareScreen


