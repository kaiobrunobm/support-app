import React from 'react'

interface SystemItemInterface {
  title: string,
  children: React.ReactNode
}

const SystemItem: React.FC<SystemItemInterface> = ({ title, children }) => {
  return (
    <div className='flex flex-col items-start self-stretch w-full py-2 border-t border-border md:w-64'>
      <h3 className='text-secondaryText text-sm'>{title}</h3>
      <p className='flex flex-col'>{children}</p>
    </div>
  )
}

export default SystemItem
