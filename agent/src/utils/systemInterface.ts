export interface AppUser {
  id: string;
  fullname: string;
  email: string;
  sector: string;
  phone: string;
  avatarUrl?: string | null; // Added avatarUrl
  role: 'USER' | 'ADMIN' | 'IT_SUPPORT';
}

interface ComputerUser {
  username: string;
  loginDate: string;
}

export interface SystemInterface {
  id: string;
  hostname: string;
  platform: string;
  distro: string;
  release: string;
  kernel: string;
  arch: string;
  uptime: string;
  anydesk?: string;
  domain?: string;
  build?: string;
  createdAt: string; 
  updatedAt: string; 

  user?: AppUser | null;

  hardware: {
    cpu: {
      manufacturer: string;
      model: string;
      cores: number;
      speed: number;
      socket?: string;
    };
    memory: {
      size: number;
      used: number;
      clockSpeed: number;
      type?: string;
    }[];
  };
  network: {
    publicIP: string;
    adapters: {
      name: string;
      ip?: string;
      mask?: string;
      mac?: string;
      type?: string;
      networkGetway?: string;
      ssidConected?: string;
    }[];
  };
  computerUsers: ComputerUser[];
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
    ip?: string | null;
    port?: string | null;
  }[];
}
