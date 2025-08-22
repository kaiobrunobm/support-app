import React from 'react'
import { useAppContext } from '../../../../utils/ContextProvider';
import Conections from './section/Conections';

const Network: React.FC = () => {
  const systemInfo = useAppContext();

  {
    if (!systemInfo) {
      return (
        <section className='bg-background text-text h-full flex flex-col justify-center items-center'>
        </section>
      )
    }

  }

  const mainAdapter = systemInfo.network.adapters.find(adapter => {
    if (adapter.ip.startsWith('192') || adapter.ip.startsWith('10')) {
      return adapter
    }
  })


  return (
    <section className='bg-background text-text h-full flex flex-col items-start'>

      <div className='px-3 py-1.5'>
        <h1 className='text-3xl font-bold'>Internet</h1>
      </div>

      <Conections name={mainAdapter.name} ip={mainAdapter.ip} mac={mainAdapter.mac.toUpperCase()} mask={mainAdapter.mask} status={mainAdapter.ip ? 'Conectado' : 'Disconectado'} typeConection={mainAdapter.type === 'wireless' ? "Wi-fi" : 'Cabeado'} speedConection={mainAdapter.speed} />
    </section >
  )
}

export default Network
