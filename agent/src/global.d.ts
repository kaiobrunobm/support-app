export { };

declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      openExternal: (url: string) => void;
      login: (email: string, password: string) => Promise<{ success: boolean; user?: any; error?: string }>;
    };
    // Add the new updater types
    updater: {
      onUpdateMessage: (callback: (channel: string, ...args: any[]) => void) => () => void;
      installUpdate: () => void;
    };
  }
}
