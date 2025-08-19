import React from 'react'
import SystemItem from '../components/SystemItem'

type disk = {
  device: string;
  type: string;
  name: string;
  vendor: string;
  serialNumber: string;
  size: number;
}


interface HardwareInterface {
  cpu: string,
  ram: string,
  storage: disk[],
}

const Hardware: React.FC<HardwareInterface> = ({ cpu, ram, storage }) => {
  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Hardware</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3
        '>
        <SystemItem title='CPU'>
          {cpu}
        </SystemItem>
        <SystemItem title='RAM'>
          {ram}
        </SystemItem>
        <SystemItem title='Armazenamento'>
          {storage?.map((disk, index) => <span key={index}>{disk.size.toFixed(0)}gb {disk.type}</span>)}
        </SystemItem>

      </div>
    </div>
  )
}

export default Hardware
