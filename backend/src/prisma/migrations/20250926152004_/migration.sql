-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "ComputerUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "loginDate" TIMESTAMP(3) NOT NULL,
    "systemId" TEXT NOT NULL,

    CONSTRAINT "ComputerUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComputerUser_systemId_idx" ON "ComputerUser"("systemId");

-- AddForeignKey
ALTER TABLE "ComputerUser" ADD CONSTRAINT "ComputerUser_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SystemInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
