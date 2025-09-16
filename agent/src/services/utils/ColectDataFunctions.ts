import axios from 'axios'
import { collectSystemInfo } from '../collectData';
import { exec } from "child_process";
import z from 'zod';
import iconv from "iconv-lite";
import { toast } from 'sonner';


const printerSchema = z.object({
  name: z.string(),
  ip: z.string().nullable().optional(),
  port: z.string().nullable().optional(),
});

const printersSchema = z.array(printerSchema);
export type Printer = z.infer<typeof printerSchema>;

const VIRTUAL_PRINTERS = [
  "oneNote",
  "xps",
  "fax",
  "pdf",
  "microsoft print to pdf",
  "onenote for windows",
  "anyDesk printer",
  "anydesk"
];

export const extractIp = (portName: string): string | null => {
  if (!portName) return null;
  const ipRegex = /\b\d{1,3}(\.\d{1,3}){3}\b/;
  const match = portName.match(ipRegex);
  return match ? match[0] : null;
}

export const getPrinters = (): Promise<Printer[]> => {
  return new Promise((resolve, reject) => {
    exec(`wmic printer get Name,PortName`, { encoding: "buffer" }, (err, stdout) => {
      if (err) return reject(err);

      const decoded = iconv.decode(stdout, "cp850");
      const lines = decoded.trim().split("\r\n").filter(line => line.trim() !== '');
      if (lines.length < 2) {

        return resolve([]);
      }

      const header = lines[0];

      const portNameIndex = header.indexOf("PortName");

      if (portNameIndex === -1) {
        return reject(new Error("Could not parse wmic output: 'PortName' header not found."));
      }

      const printerLines = lines.slice(1);

      const printers: Printer[] = printerLines
        .map(line => {

          const name = line.substring(0, portNameIndex).trim();
          const port = line.substring(portNameIndex).trim();

          return {
            name,
            ip: port ? extractIp(port) : null,
            port: port || null,
          };
        })
        .filter(p => {
          if (!p.name) return false;
          const lname = p.name.toLowerCase();

          return !VIRTUAL_PRINTERS.some(v => lname.includes(v.toLocaleLowerCase()));
        });

      try {

        resolve(printersSchema.parse(printers));
      } catch (parseError) {
        console.error("Zod parsing failed for printers:", printers);
        reject(parseError);
      }
    });
  });
}

export const formatUptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
export const copyToClipboard = (text: string) => {
  if (navigator.clipboard && window.isSecureContext) {

    toast.success(`'${text}' Copiado com sucesso`)
    return navigator.clipboard.writeText(text);
  } else {
    return new Promise((resolve, reject) => {
      try {
        document.execCommand("copy");
      } catch (err) {
        reject(err);
      }
    });
  }
}

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
  try {
    const data = await collectSystemInfo();
    console.log(data);

    const response = await axios.post(`${apiUrl}/system-info`, data);

    return response.data;

  } catch (error) {

    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.status, error.response?.data);
      throw new Error(`API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
    } else {
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  }
}


