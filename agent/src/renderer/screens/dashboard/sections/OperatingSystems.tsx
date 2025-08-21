import React from 'react'
import SystemItem from '../../components/SystemItem'


interface OperatingSystemsInterface {
  system: string,
  version: string,
  arch: string,
  kernel: string
}

const OperatingSystems: React.FC<OperatingSystemsInterface> = ({ system, version, arch, kernel }) => {
  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Sistema operacional</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3
        '>
        <SystemItem title='Sistema'>
          {system}
        </SystemItem>
        <SystemItem title='Versão'>
          {version}
        </SystemItem>
        <SystemItem title='Arquitetura'>
          {arch}
        </SystemItem>
        <SystemItem title='Kernel'>
          {kernel}
        </SystemItem>

      </div>
    </div>
  )
}

export default OperatingSystems
