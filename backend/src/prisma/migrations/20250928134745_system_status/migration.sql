-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "SystemInfo" ADD COLUMN     "status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE';
