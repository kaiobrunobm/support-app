import React from 'react';

// Use the standard input attributes for full compatibility
interface RangeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const RangeInput: React.FC<RangeInputProps> = ({ label, value, ...props }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={props.id || props.name} className="text-sm font-medium text-secondaryText">
          {label}
        </label>
        <span className="text-sm font-bold text-text">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        className="range-input" // This class applies all our custom styles from index.css
        value={value}
        {...props}
      />
    </div>
  );
};

export default RangeInput;
