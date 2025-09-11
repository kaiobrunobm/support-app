import si from 'systeminformation';
import { systemInfoSchema } from './utils/zodSchema'
import { formatUptime, getNetworkLinkSpeed, getPrinters, getPublicIP } from './utils/ColectDataFunctions';




export async function collectSystemInfo() {

  const os = await si.osInfo();
  const uptime = si.time();
  const cpu = await si.cpu();
  const memModules = await si.memLayout();
  const memoryUsage = await si.mem();
  const netInterface = await si.networkInterfaces();
  const networkGetway = await si.networkGatewayDefault();
  const wirelessConnection = await si.wifiConnections();
  const networkSpeed = await getNetworkLinkSpeed();
  const publicIP = await getPublicIP();
  const users = await si.users();
  const disks = await si.diskLayout();
  const diskUsage = await si.fsSize();
  const printers = await getPrinters();


  const data = {
    hostname: os.hostname,
    platform: os.platform,
    distro: os.distro,
    release: os.release,
    build: os.build ?? null,
    kernel: os.kernel,
    arch: os.arch,
    domain: String(os.fqdn) || 'WORKGROUP',
    uptime: formatUptime(uptime.uptime),
    hardware: {
      cpu: {
        manufacturer: cpu.manufacturer,
        model: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
        socket: cpu.socket ?? null
      },
      memory: memModules.map(memory => ({
        size: +(memory.size / 1024 / 1024 / 1024).toFixed(2),
        used: +(memoryUsage.used / 1024 / 1024 / 1024).toFixed(2),
        type: memory.type || null,
        clockSpeed: memory.clockSpeed,
      }))
    },
 network: {
  publicIP: publicIP,
  adapters: netInterface
    .filter(
      (adapter) =>
        !adapter.virtual &&
        !adapter.iface.includes('Bluetooth') &&
        !adapter.internal &&
        (adapter.type.toLowerCase() === 'wired' ||
          adapter.type.toLowerCase() === 'wireless')
    )
    .map((adapter) => {
      const connectedWifi = Array.isArray(wirelessConnection)
        ? wirelessConnection.find((net) => net.iface === adapter.iface)
        : null;

      return {
        name: adapter.iface,
        ip: adapter.ip4 || '',
        mask: adapter.ip4subnet || '',
        mac: adapter.mac || '',
        type: adapter.type || '',
        speed: networkSpeed,
        networkGetway: networkGetway || '',
        ssidConected:
          adapter.type.toLowerCase() === 'wireless' && connectedWifi
            ? connectedWifi.ssid
            : ''
      };
    })
},
    users: users.map(user => ({
      username: user.user,
      email: '',
      password: '',
      loginDate: new Date(user.date).toISOString(),
    })),
    disks: disks.map((disk, index) => ({
      device: disk.device,
      type: disk.type,
      name: disk.name,
      vendor: disk.vendor,
      serialNumber: disk.serialNum,
      size: +(disk.size / 1024 / 1024 / 1024).toFixed(2),
      used: +(diskUsage[index].used / 1024 / 1024 / 1024).toFixed(2)
    })),
    printers: printers
  };
  const parsed = systemInfoSchema.parse(data);
  return parsed;
}
