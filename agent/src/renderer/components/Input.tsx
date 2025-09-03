import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({placeholder, error, iconLeft, iconRight, ...props}) => {
  return (
 
    <div className={` flex items-center px-6 py-4 border-2 rounded-lg border-border bg-transparent ${error ? 'input-error' : ''}`}>
      {iconLeft && <span >{iconLeft}</span>}
      <input placeholder={placeholder} className="bg-background text-text outline-none flex-1 placeholder:text-secondaryText" {...props} />
      {iconRight && <span >{iconRight}</span>}
    </div>
 
  )
}

export default Input
