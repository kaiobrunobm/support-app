import React, { forwardRef} from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, error, iconLeft, iconRight, ...props }, ref) => {
    return (
     <div className={` flex items-center px-6 py-4 border-2 rounded-lg  bg-transparent ${error ? 'border-error' : 'border-border'}`}>
      {iconLeft && <span >{iconLeft}</span>}
      <input ref={ref} placeholder={placeholder} className={`bg-background outline-none flex-1 placeholder:text-secondaryText ${error ? 'text-error' : 'text-text'} `} {...props} />
      {iconRight && <span >{iconRight}</span>}
    </div>
    );
  }
);

export default Input
