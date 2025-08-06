import express from 'express';
import fs from 'fs'
import os from 'node:os';
import { exec } from 'node:child_process';
import axios from 'axios'
import si from 'systeminformation'

const app = express();
const port = 3000;


const getOs = (platform) => {
  if (platform === 'Linux') {
    const data = fs.readFileSync('/etc/os-release', 'utf8');
    const lines = data.split('\n');
    const result = {};
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) result[key] = value.replace(/"/g, '');
    });
    return result['PRETTY_NAME'];

  } else if (platform === 'Windows_NT') {
    exec('wmic os get Caption', (err, stdout) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      const lines = stdout.split('\n').filter(line => line.trim() !== '' && !line.includes('Caption'));
      const version = lines[0]?.trim();
      return (`Windows Version: ${version}`); // Example: "Microsoft Windows 10 Pro"
    });
  }
}

const getUsers = (platform) => {
  if (platform === 'Linux') {
    const passwdData = fs.readFileSync('/etc/passwd', 'utf8');

    const users = passwdData
      .split('\n')
      .filter(line => {
        if (!line.trim()) return false;
        const parts = line.split(':');
        const uid = parseInt(parts[2], 10);
        return uid >= 1000 && uid < 65534; // Typically real users fall in this range
      })
      .map(line => line.split(':')[0]);

    return users;
  } else if (platform === 'Windows_NT') {
    exec('net user', (err, stdout) => {
      if (err) {
        console.error('Error:', err);
        return;
      }

      const lines = stdout.split('\n');
      const start = lines.findIndex(line => line.includes('---')) + 1;
      const users = lines
        .slice(start)
        .join(' ')
        .split(' ')
        .map(u => u.trim())
        .filter(u => u.length > 0 && !u.includes('The command completed'));
      return (`Users: ${users}`)
    });
  }
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

  return physical.map(iface => {
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
  return (`${parseFloat(sizeInGB.toFixed(2))} GB`)
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
      used: toGigaByte(diskMetrics[index].used),
      available: toGigaByte(diskMetrics[index].available)
    }
  })
}

app.get('/', async (req, res) => {
  let data = {
    hostname: os.hostname(),
    kernel: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
    },
    os: getOs(os.type()),
    uptime: os.uptime(),
    users: getUsers(os.type()),
    hardware: {
      cpu: os.cpus()[0].model,
      memory: {
        total: os.totalmem(),
      },
    },
    network: {
      publicIP: await getPublicIP(),
      adapters: await getNetworkAdapters()
    },
    disks: await getDiskInfo()

  }
  console.log(data)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
