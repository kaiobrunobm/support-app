import React, { useState } from 'react';
import { toast } from 'sonner';
import * as apiService from '../api/apiService';

import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { CircleNotchIcon } from '@phosphor-icons/react';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, userId }) => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!passwords.oldPassword) newErrors.oldPassword = 'Senha antiga é obrigatória.';
    if (!passwords.newPassword) newErrors.newPassword = 'Nova senha é obrigatória.';
    if (passwords.newPassword.length < 6) newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres.';
    if (passwords.newPassword !== passwords.repeatPassword) newErrors.repeatPassword = 'As senhas não coincidem.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await apiService.updatePassword(userId, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Senha alterada com sucesso!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao alterar a senha.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Senha">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="oldPassword"
          type="password"
          placeholder="Senha Antiga"
          value={passwords.oldPassword}
          onChange={handleChange}
          error={errors.oldPassword}
        />
        <Input
          name="newPassword"
          type="password"
          placeholder="Nova Senha"
          value={passwords.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />
        <Input
          name="repeatPassword"
          type="password"
          placeholder="Repita a Nova Senha"
          value={passwords.repeatPassword}
          onChange={handleChange}
          error={errors.repeatPassword}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <CircleNotchIcon className="animate-spin" /> : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordChangeModal;
