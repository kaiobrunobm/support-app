import React from 'react'
import SystemItem from '../../../components/SystemItem'


interface RamInterface {
  size: number,
  used: number,
  type: string,
  clockSpeed: number
}

const Ram: React.FC<RamInterface> = ({ size, used, type, clockSpeed }) => {
  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Memoria RAM</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3
        '>
        <SystemItem title='Memoria'>
          {size.toFixed(0)}gb
        </SystemItem>
        <SystemItem title='Em uso'>
          {used.toFixed(0)}gb
        </SystemItem>
        <SystemItem title='Tipo'>
          {type ? type : 'Tipo de memoria não indentificada'}
        </SystemItem>
        <SystemItem title='Clock speed'>
          {clockSpeed === 0 || !clockSpeed ? 'Velocidade de clock não encontrada' : `${clockSpeed}MHz`}
        </SystemItem>


      </div>
    </div>

  )
}

export default Ram
