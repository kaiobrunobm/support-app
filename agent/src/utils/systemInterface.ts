export interface SystemInterface  {
    hostname: string;
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
    uptime: string;
    anydesk?: string;
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
            speed?: number;
            networkGetway?: string;
            ssidConected?: string;
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
      ip?: string | null;
      port?: string | null;
  }[];
    build?: string;
    domain?: string;
}
