import express from 'express';
import os from 'node:os';
import { execSync } from 'node:child_process';
import axios from 'axios';
import si from 'systeminformation';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

const getOs = async () => {
  const osInfo = await si.osInfo();
  return {
    platform: osInfo.platform,
    distro: osInfo.distro,
    release: osInfo.release,
    build: osInfo.build,
    kernel: osInfo.kernel,
    arch: osInfo.arch,
    domain: osInfo.fqdn,
  };
};

const getUsers = async () => {
  const users = await si.users();
  return users.map(user => ({
    user: user.user,
    loginDate: user.date,
    loginTime: user.time,
  }));
};

const getPublicIP = async () => {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    return res.data.ip;
  } catch (err) {
    console.log(err.message);
    return 'We could not find your public IP';
  }
};

const getNetworkAdapters = async () => {
  const interfaces = await si.networkInterfaces();
  const physical = interfaces.filter(iface => !iface.virtual && !iface.internal);

  return physical.map(iface => {
    const type = iface.type;
    const label = type === 'wired' ? 'Ethernet' : type === 'wireless' ? 'Wi-Fi' : 'Unknown';
    let adapterSpeed = iface.speed === 10000 ? 'gigaEthernet' : 'fastEthernet';
    return {
      name: iface.ifaceName,
      ip: iface.ip4,
      mask: iface.ip4subnet,
      mac: iface.mac,
      type: label,
      speed: adapterSpeed,
    };
  });
};

const toGigaByte = (byteSize) => {
  const sizeInGB = byteSize / (1024 ** 3);
  return parseFloat(sizeInGB.toFixed(2));
};

const getDiskInfo = async () => {
  const disks = await si.diskLayout();
  return disks.map(disk => ({
    device: disk.device,
    type: disk.type,
    name: disk.name,
    vendor: disk.vendor,
    serialNumber: disk.serialNum,
    size: toGigaByte(disk.size),
  }));
};

const getCpu = async () => {
  const cpu = await si.cpu();
  return {
    manufacturer: cpu.manufacturer,
    model: cpu.brand,
    cores: cpu.cores,
    speed: cpu.speed,
    socket: cpu.socket,
  };
};

const getMemory = async () => {
  const rams = await si.memLayout();
  return rams.map(ram => ({
    size: toGigaByte(ram.size),
    type: ram.type,
    clockSpeed: ram.clockSpeed,
  }));
};

const convertTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  let result = '';
  if (h > 0) result += `${h}h `;
  if (m > 0 || h > 0) result += `${m}m `;
  result += `${s}s`;

  return result.trim();
};

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

app.get('/', async (req, res) => {
  try {
    const os = await getOs();
    const uptime = convertTime(si.time().uptime);
    const users = await getUsers();
    const hardware = {
      cpu: await getCpu(),
      memory: await getMemory(),
    };
    const network = {
      publicIP: await getPublicIP(),
      adapters: await getNetworkAdapters(),
    };
    const disks = await getDiskInfo();
    const printers = await getPrinters();

    const report = await prisma.systemInfo.create({
      data: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        build: os.build,
        kernel: os.kernel,
        arch: os.arch,
        domain: os.domain,
        uptime: uptime,
        users: {
          create: users.map(user => ({
            user: user.user,
            loginDate: new Date(`${user.loginDate}T${user.loginTime}`),
            loginTime: user.loginTime,
          })),
        },
        hardware: {
          create: {
            cpu: {
              create: {
                manufacturer: hardware.cpu.manufacturer,
                model: hardware.cpu.model,
                cores: hardware.cpu.cores,
                speed: hardware.cpu.speed,
                socket: hardware.cpu.socket,
              },
            },
            memory: {
              create: hardware.memory.map(mem => ({
                size: mem.size,
                type: mem.type,
                clockSpeed: mem.clockSpeed,
              })),
            },
          },
        },
        network: {
          create: {
            publicIP: network.publicIP,
            adapters: {
              create: network.adapters.map(adapter => ({
                name: adapter.name,
                ip: adapter.ip,
                mask: adapter.mask,
                mac: adapter.mac,
                type: adapter.type,
                speed: adapter.speed,
              })),
            },
          },
        },
        disks: {
          create: disks.map(disk => ({
            device: disk.device,
            type: disk.type,
            name: disk.name,
            vendor: disk.vendor,
            serialNumber: disk.serialNumber,
            size: disk.size,
          })),
        },
        printers: {
          create: printers.map(printer => ({
            name: printer.name,
            port: printer.port,
            ip: printer.ip,
          })),
        },
      },
    });

    res.status(201).json({ message: 'Data saved', id: report.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to retrieve and save system data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
