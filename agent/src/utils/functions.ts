import { toast } from 'sonner'

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    // ✅ Modern API

    toast.success(`'${text}' Copiado com sucesso`)
    return navigator.clipboard.writeText(text);
  } else {
    // ⚠️ Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // prevent scrolling
    textarea.style.opacity = "0"; // invisible
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    return new Promise((resolve, reject) => {
      try {
        document.execCommand("copy");
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }
}
