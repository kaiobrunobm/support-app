-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_systemId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "systemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SystemInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
