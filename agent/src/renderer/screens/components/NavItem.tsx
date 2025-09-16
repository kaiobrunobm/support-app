import React from 'react'
import { NavLink } from 'react-router'

interface NavItemInterface {
  path: string,
  navText: string,
  icon: React.ReactElement<IconProps>,
  setNavOpen: (state: boolean) => void,
  navOpen: boolean,
  end?: boolean
}

interface IconProps {
  weight?: 'fill' | 'regular' | 'light' | 'bold' | 'thin' | 'duotone';
  size?: number;
}

const NavItem: React.FC<NavItemInterface> = ({ path, navText, icon,end,setNavOpen, navOpen }) => {
  return (
    <NavLink 
    onClick={() => setNavOpen(!navOpen)} 
    to={path} 
    end={end}
    className={({isActive}) => 
      `flex items-center self-stretch gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ease-in-out hover:bg-ghostButton/50 ${isActive && 'bg-ghostButton '} `}
      >
      {({ isActive }) => (
        <>
          {React.cloneElement(icon, { weight: isActive ? 'fill' : 'regular' })}
          
          <span className='font-medium'>{navText}</span>
        </>
      )}
    </NavLink>
  )
}

export default NavItem
