import React from 'react'
import { copyToClipboard } from '../../../../utils/functions'
import { CopySimpleIcon } from '@phosphor-icons/react';
import ricoh3710sf from '/printer-ricoh3710sf.png'
import ricoh3510sf from '/printer-ricoh3510sf.png'
import ricohmp201f from '/printer-aficiomp201.png'
import bizhubc224e from '/printer-bizhub-c224e.png'
import bizhubc308 from '/printer-bizhub-c308.png'
import canonir1643i from '/printer-canonir1643i.png'
import epsonm3180 from '/printer-epsonm3180.png'
import defaultPrinter from '/printer-default.png'

type Printer = {
  name: string;
  ip?: string;
  port?: string;
}

interface PrintersInterface {
  printers: Printer[];
}


const Printers: React.FC<PrintersInterface> = ({ printers }) => {

  const getPrinterImage = (printerName: string): string => {
    const name = printerName.toLowerCase()
  
    switch (true) {
      case name.includes("ricoh 3710sf"):
        return ricoh3710sf
  
      case name.includes("ricoh 3510sf"):
        return ricoh3510sf
  
      case name.includes("aficio mp 201"):
        return ricohmp201f
  
      case name.includes("bizhub c224e"):
        return bizhubc224e
  
      case name.includes("bizhub c308"):
        return bizhubc308
  
      case name.includes("ir1643i"):
        return canonir1643i
  
      case name.includes("m3180"):
        return epsonm3180
  
      default:
        return defaultPrinter // fallback image
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
                <div>{printer.port ? printer.port : printer.ip}</div>
                  {printer.ip && <button onClick={() => copyToClipboard(printer.ip)} className='p-2 rounded-full transition-all duration-150 ease-in-out cursor-pointer hover:bg-border'>
                  <CopySimpleIcon />
                </button>}
                </div>

                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

export default Printers
