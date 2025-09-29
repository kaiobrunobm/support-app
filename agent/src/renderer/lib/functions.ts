import { toast } from 'sonner'

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {

    toast.success(`'${text}' Copiado com sucesso`)
    return navigator.clipboard.writeText(text);
  } else {
    return new Promise((resolve, reject) => {
      try {
        document.execCommand("copy");
      } catch (err) {
        reject(err);
      }
    });
  }
}
