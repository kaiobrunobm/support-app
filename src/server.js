import express from 'express';
import os from 'node:os';
import { execSync } from 'node:child_process';
import axios from 'axios'
import si from 'systeminformation'
import snmp from 'net-snmp'

const app = express();
const port = 3000;

const getOs = async () => {
  const os = await si.osInfo()
  return {
    platform: os.platform,
    distro: os.distro,
    release: os.release,
    build: os.build,
    kernel: os.kernel,
    arch: os.arch,
    domain: os.fqdn,
  }
}

const getUsers = async () => {
  const users = await si.users()
  return users.map(user => {
    return {
      user: user.user,
      loginDate: user.date,
      loginTime: user.time,
    }
  })
}

const getPublicIP = async () => {
  try {
    const res = await axios.get('https://api.ipify.org?format=json')
    return res.data.ip
  } catch (err) {
    console.log(err.message)
    return ('We could not find your public IP')
  }
}

const getNetworkAdapters = async () => {
  const interfaces = await si.networkInterfaces();

  const physical = interfaces.filter(iface =>
    !iface.virtual && // skip virtual adapters (e.g., Docker, VM)
    !iface.internal   // skip loopback
  );

  return physical.map((iface, index) => {
    const type = iface.type; // 'wired', 'wireless', or 'unknown'
    const label = type === 'wired' ? 'Ethernet' :
      type === 'wireless' ? 'Wi-Fi' : 'Unknown';

    let adapterSpeed

    if (iface.speed === 10000) {
      adapterSpeed = 'gigaEthernet'
    } else {
      adapterSpeed = 'fastEthernet'
    }
    return {
      name: iface.ifaceName,
      ip: iface.ip4,
      mask: iface.ip4subnet,
      mac: iface.mac,
      type: label,
      speed: adapterSpeed,
    };
  });
}

const toGigaByte = (byteSize) => {
  const sizeInGB = byteSize / (1024 ** 3)
  return (parseFloat(sizeInGB.toFixed(2)))
}

const getDiskInfo = async () => {
  const disks = await si.diskLayout()
  const diskMetrics = await si.fsSize()
  return disks.map((disk, index) => {
    return {
      device: disk.device,
      type: disk.type,
      name: disk.name,
      vendor: disk.vendor,
      serialNumber: disk.serialNum,
      size: toGigaByte(disk.size),
    }
  })
}

const getCpu = async () => {
  const cpu = await si.cpu()

  return {
    manufacturer: cpu.manufacturer,
    model: cpu.brand,
    cores: cpu.cores,
    speed: cpu.speed,
    socket: cpu.socket
  }
}

const getMemory = async () => {
  const rams = await si.memLayout()

  return rams.map(ram => {
    return {
      size: toGigaByte(ram.size),
      type: ram.type,
      clockSpeed: ram.clockSpeed,

    }
  })
}

const convertTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  let result = '';
  if (h > 0) result += `${h}h `;
  if (m > 0 || h > 0) result += `${m}m `;
  result += `${s}s`;

  return result.trim();
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
      'Adobe PDF'
    ];

    const filtered = [];

    for (const printer of printersArr) {
      // Skip virtual/system printers
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

        // Exclude local loopback or empty IPs
        if (!ip || ip === '127.0.0.1' || ip === '::1') {
          continue;
        }
      } catch (e) {
        // Skip if we can't get IP
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
  let data = {
    os: await getOs(),
    uptime: convertTime(os.uptime()),
    users: await getUsers(),
    hardware: {
      cpu: await getCpu(),
      memory: await getMemory(),
    },
    network: {
      publicIP: await getPublicIP(),
      adapters: await getNetworkAdapters()
    },
    disks: await getDiskInfo(),
    printers: await getPrinters()
  }
  console.log(data)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
