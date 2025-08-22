import React from 'react'
import { ScrollArea } from "radix-ui";

type Disk = {
  device: string;
  type: string;
  name: string;
  size: number;
}

interface DataTableInterface {
  disks: Disk[]
}

const DataTable: React.FC<DataTableInterface> = ({ disks }) => {
  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport className='w-screen h-full  pr-40'>
        <table className='flex flex-col items-start'>
          <thead>
            <tr className='flex items-start bg-ghostButton border-b-text border-b rounded-t-md'>
              <th className='flex items-start  px-4 py-3 text-text font-medium min-w-52'>Drive</th>
              <th className='flex items-start  px-4 py-3 text-text font-medium min-w-52'>Capacity</th>
              <th className='flex items-start  px-4 py-3 text-text font-medium min-w-52'>Type</th>
              <th className='flex items-start  px-4 py-3 text-text font-medium min-w-52'>Name</th>
              <th className='flex items-start  px-4 py-3 text-text font-medium min-w-52'>Used</th>
            </tr>
          </thead>
          <tbody className='flex flex-col items-start '>
            {disks.map(disk => (
              <tr className='flex items-start border-b border-border text-secondaryText'>
                <td className='flex item-center justify-start px-4 py-6 text-text font-medium w-52'>{disk.device}</td>
                <td className='flex item-center justify-start px-4 py-6 w-52'>{disk.size.toFixed(0)}gb</td>
                <td className='flex item-center justify-start px-4 py-6 w-52'>{disk.type}</td>
                <td className='flex item-center justify-start px-4 py-6 w-52'>{disk.name}</td>
                <td className='flex item-center justify-start px-4 py-6 w-52'>{(disk.size / 2).toFixed(0)}gb</td>
              </tr>
            ))}
          </tbody>
        </table>


        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Viewport>
      <ScrollArea.Corner className='flex bg-border' />
    </ScrollArea.Root>





  )
}

export default DataTable
