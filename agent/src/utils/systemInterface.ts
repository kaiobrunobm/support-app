export interface SystemInterface {
  hostname: string;
  platform: string;
  distro: string;
  release: string;
  build?: string | null;
  kernel: string;
  arch: string;
  domain: string;
  uptime: string;
  hardware: {
    cpu: {
      manufacturer: string;
      model: string;
      cores: number;
      speed: number;
      socket?: string | null;
    };
    memory: {
      size: number;
      used: number;
      type?: string | null;
      clockSpeed: number;
    }[];
  };
  network: {
    publicIP: string,
    speedTest: {
      upload: number,
      download: number
    }
    adapters: {
      name: string;
      ip: string | null;
      mask: string | null;
      mac: string | null;
      type: string | null;
      speed: number | null;
      networkGetway: string | null;
      ssidConected: string | null;
    }[];
  };
  users: {
    username: string;
    loginDate: string;
  }[];
  disks: {
    device: string;
    type: string;
    name: string;
    vendor: string;
    serialNumber: string;
    size: number;
    used: number;
  }[];
  printers: {
    name: string;
    ip: string | null;
    port: string | null;
  }[];
}
