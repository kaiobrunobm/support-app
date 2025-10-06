import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Progress } from '@radix-ui/react-progress';

const Updater: React.FC = () => {
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    const handleUpdateMessage = (event: string, ...args: any[]) => {
      switch (event) {

        case 'update-available': {
           toast.loading('Atualização disponível, baixando...', {
            id: toastId,
            duration: Infinity,
          });
          break;
        }

        case 'download-progress': {
          const progress = args[0];
          const percent = Math.round(progress.percent);
          toast.loading(
            <div className="w-full">
                <p className="mb-2">Baixando atualização</p>
                <Progress value={percent} className="w-full h-2 bg-text" />
            </div>, {
            id: toastId,
            duration: Infinity,
          });
          break;
        }

        case 'update-downloaded': {
          const info = args[0];
          toast(`Atualização v${info.version} pronta.`, {
            id: toastId,
            duration: Infinity, 
            description: 'Reinicie o aplicativo para aplicar a atualização',
            action: {
              label: 'Reiniciar',
              onClick: () => {
                window.updater.installUpdate();
              },
            },
            cancel: {
                label: 'Depois',
                onClick: () => {
                    toast.dismiss(toastId);
                    setToastId(null);
                }
            }
          });
          break;
        }

        case 'error': {
          toast.error('Falha ao verificar atualizações.', {
            id: toastId,
            description: args[0]?.message || 'Por favor, tente novamente mais tarde.',
            duration: 5000,
          });
          setTimeout(() => setToastId(null), 5100);
          break;
        }
      }
    };
    
    if (window.updater && typeof window.updater.onUpdateMessage === 'function') {
        const cleanup = window.updater.onUpdateMessage(handleUpdateMessage);

        return () => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        };
    } else {
        console.warn("Updater API not found. The app will work, but auto-updates will not have notifications.");
    }

  }, [toastId]);

  return null;
};

export default Updater;

