import React, { useEffect, useState } from 'react'

export interface SystemInfo {
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
      type?: string | null;
      clockSpeed: number;
    }[];
  };
  network: {
    publicIP: string;
    adapters: {
      name: string;
      ip: string | null;
      mask: string | null;
      mac: string | null;
      type: string | null;
      speed: string | null;
    }[];
  };
  users: {
    username: string;
    loginDate: string;
    loginTime: string;
  }[];
  disks: {
    device: string;
    type: string;
    name: string;
    vendor: string;
    serialNumber: string;
    size: number;
  }[];
  printers: {
    name: string;
    ip: string | null;
    port: string | null;
  }[];
}


const App: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    window.electronAPI.getSystemInfo().then((info: SystemInfo) => {
      setSystemInfo(info)
    })
  }, [])

  if (!systemInfo) return <div>...Loading</div>

  console.log(systemInfo)
  return (
    <main className='h-screen flex items-start justify-center pt-20'>
      <h1 className='text-4xl font-bold'>Hello support-app</h1>

    </main>
  )
}

export default App
