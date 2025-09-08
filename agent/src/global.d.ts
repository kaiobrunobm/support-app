export { };

declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      openExternal: (url: string) => void;
      login: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
    };
  }
}

