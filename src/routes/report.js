import express from 'express'
import { PrismaClient } from '@prisma/client'


const router = express.Router()
const prisma = new PrismaClient()

router.post('/report', async (req, res) => {
  try {
    const {
      os,
      uptime,
      users,
      hardware,
      network,
      disks,
      printers
    } = req.body

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
          }))
        },

        hardware: {
          create: {
            cpu: {
              create: {
                manufacturer: hardware.cpu.manufacturer,
                model: hardware.cpu.model,
                cores: hardware.cpu.cores,
                speed: hardware.cpu.speed,
                socket: hardware.cpu.socket
              }
            },
            memory: {
              create: hardware.memory.map(mem => ({
                size: mem.size,
                type: mem.type,
                clockSpeed: mem.clockSpeed
              }))
            }
          }
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
                speed: adapter.speed
              }))
            }
          }
        },

        disks: {
          create: disks.map(disk => ({
            device: disk.device,
            type: disk.type,
            name: disk.name,
            vendor: disk.vendor,
            serialNumber: disk.serialNumber,
            size: disk.size
          }))
        },

        printers: {
          create: printers.map(printer => ({
            name: printer.name,
            port: printer.port,
            ip: printer.ip
          }))
        }
      }
    })

    res.status(201).json({ message: 'Data saved', id: report.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

export default router
