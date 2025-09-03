import React from 'react'
import { copyToClipboard } from '../../../../utils/functions'
import { CopySimpleIcon } from '@phosphor-icons/react';

type Printer = {
  name: string;
  ip: string;
  port: string;
}

interface PrintersInterface {
  printers: Printer[];
}


const Printers: React.FC<PrintersInterface> = ({ printers }) => {

  const getPrinterImage = (printerName: string): string => {
    const name = printerName.toLowerCase()
  
    switch (true) {
      case name.includes("ricoh 3710sf"):
        return "/printer-ricoh3710sf.png"
  
      case name.includes("ricoh 3510sf"):
        return "/printer-ricoh3510sf.png"
  
      case name.includes("aficio mp 201"):
        return "/printer-aficiomp201.png"
  
      case name.includes("bizhub c224e"):
        return "/printer-bizhub-c224e.png"
  
      case name.includes("bizhub c308"):
        return "/printer-bizhub-c308.png"
  
      case name.includes("ir1643i"):
        return "/printer-canonir1643i.png"
  
      case name.includes("m3180"):
        return "/printer-epsonm3180.png"
  
      default:
        return "/printer-default.png" // fallback image
    }
  }

  return (
    <div className='flex flex-col items-start self-stretch gap-3 px-3 py-1.5'>
      <h2 className='text-lg font-bold'>Impressoras</h2>
      <div className='flex flex-wrap items-start self-stretch mt-6 gap-3 p-2 md:gap-x-8 md:gap-y-3
        '>
            {printers.map((printer, index) => (
              <div key={index} className='flex flex-row'>
                <div className='h-48 w-72 flex items-center justify-center'>
                <img src={getPrinterImage(printer.name)} className='h-48'/>
                </div>
                <div className='flex flex-col items-start'>
                <span className='font-bold text-lg'>{printer.name}</span>
                <div className='flex items-center gap-2'>
                <div className='color-blue-600'>{printer.ip}</div>
                <button onClick={() => copyToClipboard(printer.ip)} className='p-2 rounded-full transition-all duration-150 ease-in-out cursor-pointer hover:bg-border'>
                  <CopySimpleIcon />
                </button>
                </div>

                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

export default Printers
