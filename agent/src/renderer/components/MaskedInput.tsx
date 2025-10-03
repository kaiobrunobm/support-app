import React from 'react';
import { IMaskInput, useIMask } from 'react-imask';
import Input from './Input'; // We'll reuse your existing styled Input component

interface MaskedInputProps {
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  mask: string;
}

const MaskedInput: React.FC<MaskedInputProps> = ({ mask, onChange, name, ...props }) => {
  const { ref } = useIMask(
    { mask },
    {
      onAccept: (value) => {
        const event = {
          target: { name, value },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      },
    }
  );

  return <Input ref={ref as React.RefObject<HTMLInputElement>} name={name} {...props} />;
};

export default MaskedInput;
