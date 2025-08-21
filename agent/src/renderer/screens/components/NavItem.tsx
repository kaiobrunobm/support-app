import React from 'react'
import { Link } from 'react-router'

interface NavItemInterface {
  path: string,
  active?: boolean,
  navText: string,
  icon: React.ReactNode,
  setNavOpen: (state: boolean) => void,
  navOpen: boolean
}

const NavItem: React.FC<NavItemInterface> = ({ path, active, navText, icon, setNavOpen }) => {
  return (
    <Link onClick={() => setNavOpen(!navOpen)} to={path} className={`flex items-center self-stretch gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-ghostButton/50 ${active && 'bg-ghostButton hover:bg-ghostButton'} `}>
      {icon}
      <span className='font-medium'>{navText}</span>
    </Link>
  )
}

export default NavItem
