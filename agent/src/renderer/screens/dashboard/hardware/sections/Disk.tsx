import React from 'react'
import DataTable from '../../../components/DataTable'

type Disk = {
  device: string;
  type: string;
  name: string;
  size: number;
}

interface DiskInterface {
  disks: Disk[]
}

const Disk: React.FC<DiskInterface> = ({ disks }) => {
  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Armazenamento</h2>
      <div className='flex flex-wrap items-start self-stretch gap-3 p-2 md:gap-x-8 md:gap-y-3'>
        <DataTable disks={disks} />
      </div>
    </div >

  )
}

export default Disk
