import si from 'systeminformation';
import fetch from 'node-fetch';
import { z } from 'zod';
import axios from 'axios'

const systemInfoSchema = z.object({
  hostname: z.string(),
  platform: z.string(),
  distro: z.string(),
  release: z.string(),
  build: z.string().nullable().optional(),
  kernel: z.string(),
  arch: z.string(),
  domain: z.string(),
  uptime: z.string(),
  hardware: z.object({
    cpu: z.object({
      manufacturer: z.string(),
      model: z.string(),
      cores: z.number(),
      speed: z.number(),
      socket: z.string().nullable().optional()
    }),
    memory: z.array(z.object({
      size: z.number(),
      type: z.string().nullable().optional(),
      clockSpeed: z.number()
    }))
  }),
  network: z.object({
    publicIP: z.string(),
    adapters: z.array(z.object({
      name: z.string(),
      ip: z.string().nullable(),
      mask: z.string().nullable(),
      mac: z.string().nullable(),
      type: z.string().nullable(),
      speed: z.string().nullable()
    }))
  }),
  users: z.array(z.object({
    username: z.string(),
    loginDate: z.string(),
    loginTime: z.string()
  })),
  disks: z.array(z.object({
    device: z.string(),
    type: z.string(),
    name: z.string(),
    vendor: z.string(),
    serialNumber: z.string(),
    size: z.number()
  })),
  printers: z.array(z.object({
    name: z.string(),
    ip: z.string().nullable(),
    port: z.string().nullable()
  }))
});

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
const getPrinters = async () => {
  try {
    const printersRaw = execSync(
      'powershell "Get-Printer | Select-Object Name,PortName | ConvertTo-Json"',
      { encoding: 'utf8' }
    );
    const printers = JSON.parse(printersRaw);
    const printersArr = Array.isArray(printers) ? printers : [printers];

    const virtualPrinterNames = [
      'Microsoft Print to PDF',
      'Microsoft XPS Document Writer',
      'Fax',
      'OneNote',
      'Send To OneNote',
      'PDF',
      'Bullzip PDF Printer',
      'Adobe PDF',
    ];

    const filtered = [];

    for (const printer of printersArr) {
      if (
        virtualPrinterNames.some(v => printer.Name.includes(v)) ||
        /^(NUL|LPT|COM|FILE|XPS|USB|PORTPROMPT)/i.test(printer.PortName)
      ) {
        continue;
      }

      let ip = null;
      try {
        const portRaw = execSync(
          `powershell "Get-PrinterPort -Name '${printer.PortName}' | Select-Object -ExpandProperty PrinterHostAddress"`,
          { encoding: 'utf8' }
        );
        ip = portRaw.trim() || null;

        if (!ip || ip === '127.0.0.1' || ip === '::1') {
          continue;
        }
      } catch (e) {
        continue;
      }

      filtered.push({
        name: printer.Name,
        port: printer.PortName,
        ip,
      });
    }

    return filtered;
  } catch (err) {
    console.error('Failed to get printers:', err);
    return [];
  }
};

export async function collectSystemInfo() {
  const os = await si.osInfo();
  const uptime = si.time();
  const cpu = await si.cpu();
  const memModules = await si.memLayout();
  const netInt = await si.networkInterfaces();
  const getPublicIP = async () => {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    return res.data.ip;
  } catch (err) {
    console.log(err.message);
    return 'We could not find your public IP';
  }
};
  const publicIP = await getPublicIP();
  const users = await si.users();
  const disks = await si.diskLayout();
  const printers = await getPrinters();

  const data = {
    hostname: os.hostname,
    platform: os.platform,
    distro: os.distro,
    release: os.release,
    build: os.build ?? null,
    kernel: os.kernel,
    arch: os.arch,
    domain: os.fqdn || 'WORKGROUP',
    uptime: formatUptime(uptime.uptime),
    hardware: {
      cpu: {
        manufacturer: cpu.manufacturer,
        model: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
        socket: cpu.socket ?? null
      },
      memory: memModules.map(m => ({
        size: +(m.size / 1024 / 1024 / 1024).toFixed(2),
        type: m.type || null,
        clockSpeed: m.clockSpeed
      }))
    },
    network: {
      publicIP: publicIP,
      adapters: netInt.map(n => ({
        name: n.iface,
        ip: n.ip4 || '',
        mask: n.ip4subnet || '',
        mac: n.mac || '',
        type: n.type || '',
        speed: n.iface.speed === 10000 ? 'gigaEthernet' : 'fastEthernet',
      }))
    },
    users: users.map(u => ({
      username: u.user,
      loginDate: new Date(u.date).toISOString(),
      loginTime: new Date(u.date).toTimeString().split(' ')[0].slice(0, 5)
    })),
    disks: disks.map(d => ({
      device: d.device,
      type: d.type,
      name: d.name,
      vendor: d.vendor,
      serialNumber: d.serialNum,
      size: +(d.size / 1024 / 1024 / 1024).toFixed(2)
    })),
    printers: printers
  };

  const parsed = systemInfoSchema.parse(data);
  return parsed;
}

export async function sendToAPI(apiUrl: string) {
  const data = await collectSystemInfo();
  console.log(data)
  const res = await fetch(`${apiUrl}/system-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${await res.text()}`);
  }

  return await res.json();
}
