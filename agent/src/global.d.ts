export {};

declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      openExternal: (url:string) => void;
      showSummaryNotification: (body: string) => void;
      updater: {
        onUpdateMessage: (callback: (event: string, ...args: any[]) => void) => () => void;
        installUpdate: () => void;
      };
    };
  }
}

