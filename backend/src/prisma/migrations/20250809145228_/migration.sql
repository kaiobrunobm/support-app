-- CreateTable
CREATE TABLE "SystemInfo" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "distro" TEXT NOT NULL,
    "release" TEXT NOT NULL,
    "build" TEXT,
    "kernel" TEXT NOT NULL,
    "arch" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "uptime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hardwareId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "SystemInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "loginDate" TIMESTAMP(3) NOT NULL,
    "loginTime" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hardware" (
    "id" TEXT NOT NULL,
    "cpuId" TEXT NOT NULL,

    CONSTRAINT "Hardware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CPU" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "socket" TEXT,

    CONSTRAINT "CPU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "type" TEXT,
    "clockSpeed" INTEGER NOT NULL,
    "hardwareId" TEXT NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Network" (
    "id" TEXT NOT NULL,
    "publicIP" TEXT NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adapter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "mask" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "Adapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disk" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "systemId" TEXT NOT NULL,

    CONSTRAINT "Disk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Printer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "port" TEXT,
    "ip" TEXT,
    "systemId" TEXT NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemInfo_hostname_domain_key" ON "SystemInfo"("hostname", "domain");

-- CreateIndex
CREATE INDEX "User_systemId_idx" ON "User"("systemId");

-- CreateIndex
CREATE INDEX "Hardware_cpuId_idx" ON "Hardware"("cpuId");

-- CreateIndex
CREATE INDEX "Memory_hardwareId_idx" ON "Memory"("hardwareId");

-- CreateIndex
CREATE INDEX "Adapter_networkId_idx" ON "Adapter"("networkId");

-- CreateIndex
CREATE INDEX "Disk_systemId_idx" ON "Disk"("systemId");

-- CreateIndex
CREATE INDEX "Printer_systemId_idx" ON "Printer"("systemId");

-- AddForeignKey
ALTER TABLE "SystemInfo" ADD CONSTRAINT "SystemInfo_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "Hardware"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemInfo" ADD CONSTRAINT "SystemInfo_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SystemInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hardware" ADD CONSTRAINT "Hardware_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "CPU"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "Hardware"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adapter" ADD CONSTRAINT "Adapter_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disk" ADD CONSTRAINT "Disk_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SystemInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Printer" ADD CONSTRAINT "Printer_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SystemInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
