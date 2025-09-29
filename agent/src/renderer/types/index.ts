export interface AppUser {
  id: string;
  fullname: string;
  email: string;
  sector: string;
  phone: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN' | 'IT_SUPPORT';
  loginDate: string; 
}

export interface ComputerUser {
  id: string;
  username: string;
  loginDate: string; 
}

export interface MemoryModule {
  size: number;
  used: number;
  clockSpeed: number;
  type?: string;
}

export interface NetworkAdapter {
  name: string;
  ip?: string;
  mask?: string;
  mac?: string;
  type?: string;
  networkGetway?: string;
  ssidConected?: string;
}

export interface DiskDrive {
  device: string;
  type: string;
  name: string;
  vendor: string;
  serialNumber: string;
  size: number;
  used: number;
}

export interface Printer {
  name: string;
  ip?: string | null;
  port?: string | null;
}

export interface SystemInfo {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED';
  hostname: string;
  platform: string;
  distro: string;
  release: string;
  kernel: string;
  arch: string;
  uptime: string;
  anydesk?: string | null;
  domain?: string;
  build?: string;
  createdAt: string; 
  updatedAt: string; 
  userDetachedAt?: string | null; 

  user?: AppUser | null;
  computerUsers: ComputerUser[];
  hardware: {
    cpu: {
      manufacturer: string;
      model: string;
      cores: number;
      speed: number;
      socket?: string;
    };
    memory: MemoryModule[];
  };
  network: {
    publicIP: string;
    adapters: NetworkAdapter[];
  };
  disks: DiskDrive[];
  printers: Printer[];
}

export interface Message {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  senderId: string;
  sender: {
    fullname: string;
    avatarUrl?: string | null;
    role: 'USER' | 'ADMIN' | 'IT_SUPPORT';
  };
}

export interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CANCELLED';
  createdAt: string; 
  updatedAt: string; 
  
  requester: AppUser;
  assignee?: AppUser | null;
  system: {
    id: string;
    hostname: string;
  };
  messages: Message[];
}

export interface CreateUserData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  sector: string;
  phone: string;
  role: 'USER' | 'IT_SUPPORT';
  systemId: string;
  avatarUrl?: string | null;
}

export interface ReassignUserData {
  userId: string;
  newSystemId: string;
}

export interface UpdateSystemData {
  hostname?: string;
  domain?: string;
  anydesk?: string;
}

export interface CreateTicketData {
  subject: string;
  initialMessage: string;
}

export interface AddMessageData {
  content: string;
  imageUrl?: string;
}

export interface UpdateTicketStatusData {
  status: 'PENDING' | 'RESOLVED';
}

export interface DashboardStats {
  openTickets: number;
  pendingTickets: number;
  resolvedToday: number;
  totalSystems: number;
  systemsNeedingUsers: number;
}

export interface TicketSummary {
  id: string;
  subject: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CANCELLED';
  createdAt: string;
  requester: {
    fullname: string;
    sector: string;
    avatarUrl?: string | null;
  };
  system: {
    hostname: string;
  };
}

export interface SystemSummary {
  id: string;
  hostname: string;
  distro: string;
  updatedAt: string; 
  createdAt: string; 
  user?: {
    fullname: string;
    avatarUrl?: string | null;
  } | null;
  network: {
    adapters: { ip?: string }[];
  };
  _count: {
    tickets: number;
  };

}
