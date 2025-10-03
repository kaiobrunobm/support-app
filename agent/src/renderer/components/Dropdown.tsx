import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDownIcon } from '@phosphor-icons/react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  selected: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onSelect, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  // State to determine if the menu should open upwards or downwards
  const [openDirection, setOpenDirection] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // This effect checks the position of the dropdown on the screen when it opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Estimate menu height (approx 40px per item, max 6 items + padding)
      const estimatedMenuHeight = Math.min(options.length, 6) * 40 + 16; 

      // If there isn't enough space below, open on top
      if (spaceBelow < estimatedMenuHeight) {
        setOpenDirection('top');
      } else {
        setOpenDirection('bottom');
      }
    }
  }, [isOpen, options.length]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-secondaryText mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-left text-text outline-none transition-colors ${error ? 'border-error' : 'border-border'}`}
      >
        <span className={selected ? 'text-text' : 'text-secondaryText'}>
          {selected ? selected.label : `Selecione um ${label.toLowerCase()}`}
        </span>
        <CaretDownIcon size={20} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: openDirection === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openDirection === 'bottom' ? -10 : 10 }}
            transition={{ duration: 0.2 }}

            className={`
              absolute z-20 w-full rounded-lg border border-border bg-background shadow-lg
              ${openDirection === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}
              max-h-60 overflow-y-scroll scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent
            `}

          > 
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="cursor-pointer px-4 py-4 text-text hover:bg-border/50"
              >
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default Dropdown;

