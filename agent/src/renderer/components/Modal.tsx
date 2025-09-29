import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from '@phosphor-icons/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Modal Content */}
        <motion.div
          className="relative z-10 w-full max-w-lg rounded-lg border bg-background border-border bg-card shadow-xl"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/50">
              <XIcon size={20} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
