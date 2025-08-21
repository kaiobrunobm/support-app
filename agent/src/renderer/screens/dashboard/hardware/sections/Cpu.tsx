import React from 'react'
import SystemItem from '../../../components/SystemItem'


interface CpuInterface {
  manufacturer: string,
  model: string,
  cores: number,
  clockSpeed: number,
  socket: string
}

const Cpu: React.FC<CpuInterface> = ({ manufacturer, model, cores, clockSpeed, socket }) => {
  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Hardware</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3
        '>
        <SystemItem title='Marca'>
          {manufacturer}
        </SystemItem>
        <SystemItem title='Modelo'>
          {model}
        </SystemItem>
        <SystemItem title='Cores'>
          {cores}
        </SystemItem>
        <SystemItem title='Clock speed'>
          {clockSpeed.toFixed(2)} Ghz
        </SystemItem>
        <SystemItem title='Socket'>
          {socket}
        </SystemItem>


      </div>
    </div>

  )
}

export default Cpu
