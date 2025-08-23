import { execSync } from 'node:child_process';
import axios from 'axios'
import fetch from 'node-fetch';
import { collectSystemInfo } from '../collectData';

export const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export const getPrinters = async () => {
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

export const getPublicIP = async () => {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    return res.data.ip;
  } catch (err) {
    console.log(err.message);
    return 'We could not find your public IP';
  }
};

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


