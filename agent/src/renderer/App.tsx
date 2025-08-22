import React from 'react'
import { Link } from 'react-router';

const App: React.FC = () => {

  return (
    <main className='bg-background text-text h-screen flex items-start justify-center pt-20'>
      <div className='flex flex-col items-center'>

        <h1 className='text-3xl font-bold mb-10'>Hello</h1>
        <div className='flex items-center gap-4'>
          <Link to="/dashboard" className='text-blue-600 font-medium hover:underline'>Dashboard</Link>
          <Link to="/admin" className='text-blue-600 font-medium hover:underline'>Admin</Link>
        </div>

      </div>

    </main>
  )
}

export default App
