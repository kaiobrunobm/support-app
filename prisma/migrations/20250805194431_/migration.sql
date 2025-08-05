-- CreateTable
CREATE TABLE "public"."Computer" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "osVersion" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "systemUptime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "domain" TEXT,
    "lastLogin" TIMESTAMP(3),
    "primaryUserId" TEXT,

    CONSTRAINT "Computer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecentUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "computerId" TEXT NOT NULL,

    CONSTRAINT "RecentUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hardware" (
    "id" TEXT NOT NULL,
    "cpuModel" TEXT NOT NULL,
    "cpuCores" INTEGER NOT NULL,
    "totalMemoryMB" INTEGER NOT NULL,
    "gpuModel" TEXT NOT NULL,
    "computerId" TEXT NOT NULL,

    CONSTRAINT "Hardware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Disk" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacityGB" DOUBLE PRECISION NOT NULL,
    "freeSpaceGB" DOUBLE PRECISION NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "hardwareId" TEXT NOT NULL,

    CONSTRAINT "Disk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Motherboard" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "biosVersion" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "hardwareId" TEXT NOT NULL,

    CONSTRAINT "Motherboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Network" (
    "id" TEXT NOT NULL,
    "publicIpAddress" TEXT,
    "computerId" TEXT NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NetworkAdapter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "isWireless" BOOLEAN NOT NULL,
    "dnsServers" TEXT[],
    "dhcpEnabled" BOOLEAN NOT NULL,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "NetworkAdapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Printer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "serialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pagesPrinted" INTEGER NOT NULL,
    "computerId" TEXT NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TonerLevel" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "printerId" TEXT NOT NULL,

    CONSTRAINT "TonerLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrinterLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "severity" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,

    CONSTRAINT "PrinterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PerformanceMetrics" (
    "id" TEXT NOT NULL,
    "cpuUsagePercent" DOUBLE PRECISION NOT NULL,
    "memoryUsagePercent" DOUBLE PRECISION NOT NULL,
    "lastCollectionTimestamp" TIMESTAMP(3) NOT NULL,
    "computerId" TEXT NOT NULL,

    CONSTRAINT "PerformanceMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "severity" TEXT NOT NULL,
    "computerId" TEXT NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hardware_computerId_key" ON "public"."Hardware"("computerId");

-- CreateIndex
CREATE UNIQUE INDEX "Motherboard_hardwareId_key" ON "public"."Motherboard"("hardwareId");

-- CreateIndex
CREATE UNIQUE INDEX "Network_computerId_key" ON "public"."Network"("computerId");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceMetrics_computerId_key" ON "public"."PerformanceMetrics"("computerId");

-- AddForeignKey
ALTER TABLE "public"."Computer" ADD CONSTRAINT "Computer_primaryUserId_fkey" FOREIGN KEY ("primaryUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecentUser" ADD CONSTRAINT "RecentUser_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "public"."Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hardware" ADD CONSTRAINT "Hardware_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "public"."Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Disk" ADD CONSTRAINT "Disk_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "public"."Hardware"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Motherboard" ADD CONSTRAINT "Motherboard_hardwareId_fkey" FOREIGN KEY ("hardwareId") REFERENCES "public"."Hardware"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Network" ADD CONSTRAINT "Network_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "public"."Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NetworkAdapter" ADD CONSTRAINT "NetworkAdapter_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Printer" ADD CONSTRAINT "Printer_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "public"."Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TonerLevel" ADD CONSTRAINT "TonerLevel_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "public"."Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrinterLog" ADD CONSTRAINT "PrinterLog_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "public"."Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PerformanceMetrics" ADD CONSTRAINT "PerformanceMetrics_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "public"."Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "public"."Computer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
