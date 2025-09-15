import { CopySimpleIcon } from '@phosphor-icons/react'
import { copyToClipboard } from '../../../../utils/functions'
import React from 'react'

import SystemItem from '../../components/SystemItem'

type adapter = {
  name: string;
  ip?: string | null;
  mask?: string | null;
  mac?: string | null;
  type?: string | null;
}

interface NetworkInterface {
  adapter: adapter[] | null,
  publicIp: string,

}

const Network: React.FC<NetworkInterface> = ({ adapter, publicIp }) => {



  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Internet</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3
        '>
        <SystemItem title='Endereço IP'>
          <span className='flex flex-row items-center gap-2'>
            {adapter ? adapter?.map(adapter => adapter.ip) : 'IP  não encontrado'}
            <button onClick={() => copyToClipboard(adapter[0].ip)} className={`p-2 rounded-full transition-all duration-150 ease-in-out cursor-pointer hover:bg-border ${!adapter && 'hidden'} `}>
              <CopySimpleIcon />
            </button>
          </span>
        </SystemItem>
        <SystemItem title='MAC'>
          <span className='flex flex-row items-center gap-2'>
            {adapter ? adapter?.map(adapter => adapter.mac.toUpperCase()) : 'Endereço MAC não encontrado'}
            <button onClick={() => copyToClipboard(adapter[0].mac.toUpperCase())} className='p-2 rounded-full transition-all duration-150 ease-in-out cursor-pointer hover:bg-border'>
              <CopySimpleIcon />
            </button>
          </span>

        </SystemItem>
        <SystemItem title='IP publico'>
          <span className='flex flex-row items-center gap-2'>
            {publicIp}
            <button onClick={() => copyToClipboard(publicIp)} className='p-2 rounded-full transition-all duration-150 ease-in-out cursor-pointer hover:bg-border'>
              <CopySimpleIcon />
            </button>
          </span>
        </SystemItem>

      </div>
    </div >
  )
}

export default Network
