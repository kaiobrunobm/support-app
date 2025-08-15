export { };

declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>; // Replace `any` with SystemInfo type if needed
    };
  }
}

