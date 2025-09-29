import { UserIcon } from "@phosphor-icons/react";
import { AppUser } from "../../../utils/systemInterface";
import React from "react";


const Avatar: React.FC<AppUser> = ({ avatarUrl }) => {
  return (
    <>
    {
    avatarUrl ? 
    <img src={avatarUrl} alt="user avatar" className='w-8 h-8 rounded-full bg-border flex items-center justify-center cursor-pointer '/> 
    :
      <span className='w-8 h-8 rounded-full bg-border flex items-center justify-center cursor-pointer '>
        <UserIcon size={20} />
      </span>
    }
    
    </>
    
  )
}

export default Avatar
