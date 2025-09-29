import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { AppUser, SystemInfo } from '../types';
import { WarningIcon } from '@phosphor-icons/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: AppUser;
  oldSystem: SystemInfo;
  newSystem: SystemInfo;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, user, oldSystem, newSystem }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <WarningIcon size={24} className="text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Confirmar Reatribuição de Usuário</h3>
              <p className="mt-2 text-sm text-secondaryText">
                O usuário <strong className="text-text">{user.fullname}</strong> ({user.email}) já está atribuído ao sistema <strong className="text-text">{oldSystem.hostname}</strong>.
              </p>
              <p className="mt-2 text-sm text-secondaryText">
                Você deseja desvinculá-lo do sistema antigo e atribuí-lo ao novo sistema <strong className="text-text">{newSystem.hostname}</strong>?
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Sim, Reatribuir
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
