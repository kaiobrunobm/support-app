import React from 'react'
import { Link } from 'react-router'
const Admin: React.FC = () => {
  return (
    <section>
      <h1>Hello admin</h1>
      <Link to='/' className='text-blue-600 font-medium hover:underline'>Back</Link>
    </section>
  )
}

export default Admin
