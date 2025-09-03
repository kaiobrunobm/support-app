export { };

declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>; 
      openExternal: (url: string) => void;
    };
  }
}

