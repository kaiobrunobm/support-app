import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../../context/ContextProvider';
import { toast } from 'sonner';
import Input from '../../components/Input';
import Button from '../../components/Button';
import logo from '/tray-icon.png';
import { EyeSlashIcon, EyeIcon, CircleNotchIcon } from '@phosphor-icons/react';

const LoginPage: React.FC = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password);

      if (response.status === 'success') {
        navigate('/app/dashboard');
      } else {
        // Handle other statuses like 'reassignment_required' here later
        toast.error("Email ou senha inválidos");
        setError("Email ou senha inválidos");
      }
    } catch (err) {
      toast.error("Erro ao fazer login. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className='bg-background text-text h-screen flex flex-col items-center justify-between'>

      <div className='flex justify-end p-4 w-screen'>
      </div>
      <div>
        <div className='flex flex-col items-center gap-3'>
          <img src={logo} className='w-11 h-11' />
          <h1 className='font-bold text-2xl'>Entre em sua conta</h1>
        </div>
        <form className='flex flex-col justify-end itens-center py-6 gap-3' onSubmit={handleLogin}>

          <Input error={error} placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input error={error} type={showPassword ? 'text' : 'password'} placeholder='Senha' iconRight={showPassword ? <EyeIcon size={24} className='text-secondaryText cursor-pointer' onClick={() => setShowPassword(!showPassword)} /> : <EyeSlashIcon size={24} className='text-secondaryText cursor-pointer' onClick={() => setShowPassword(!showPassword)} />} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className='text-error'>{error}</p>}
          <Button type='submit'>{isLoading ? <CircleNotchIcon size={24} className='animate-spin' /> : "Entrar"}</Button>
        </form>
      </div>

      <span className='text-xs text-secondaryText py-4'>© SystemPulse v0.0.6 - Todos direitos reservados </span>

    </main>
  );
};

export default LoginPage;
