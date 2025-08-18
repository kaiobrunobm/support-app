import React from 'react'
import { Link } from 'react-router'
import { useAppContext } from '../../utils/ContextProvider';

const Dashboard: React.FC = () => {
  const systemInfo = useAppContext();


  return (
    <section className='h-screen flex flex-col'>
      <header className='px-4 py-2'>
        <Link to='/' className='text-blue-600 font-medium hover:underline'>Back</Link>
      </header>
      <div className='px-4'>
        <p>Hostname: {systemInfo?.hostname}</p>
        <p>PublicIP: {systemInfo?.network.publicIP}</p>
      </div>
      <div>
      </div>
    </section>
  )
}

export default Dashboard
