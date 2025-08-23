import React from 'react'
import SystemItem from '../../../components/SystemItem'
import speedTest from "speedtest-net";

interface ConectionsInterface {
  name: string,
  ip: string,
  mac: string,
  mask: string,
  status: string,
  typeConection: string,
  speedConection: number | null,
  getway: string,
  ssidConected: string | null
}

const Conections: React.FC<ConectionsInterface> = ({ name, ip, mac, mask, status, typeConection, speedConection, getway, ssidConected }) => {



  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Conexões</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3'>

        <SystemItem title='Nome do adaptador'>
          {name}
        </SystemItem>

        <SystemItem title='Endereço IP'>
          {ip}
        </SystemItem>

        <SystemItem title='MAC'>
          {mac}
        </SystemItem>

        <SystemItem title='Getway padrão'>
          {getway}
        </SystemItem>


        <SystemItem title='Mascara de subrede'>
          {mask}
        </SystemItem>

        <SystemItem title='Status'>
          {status}
        </SystemItem>

        <SystemItem title='Tipo de conexão'>
          {typeConection}
        </SystemItem>

        {ssidConected && (
          <SystemItem title='Wi-fi conectado'>
            {ssidConected}
          </SystemItem>
        )}

        <SystemItem title='Velocidade da conexão'>
          {speedConection ? speedConection : 'Velocidade de conexão não encontrada'}
        </SystemItem>



      </div>
    </div>

  )
}

export default Conections
