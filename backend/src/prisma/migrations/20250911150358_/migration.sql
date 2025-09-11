/*
  Warnings:

  - You are about to drop the column `speed` on the `Adapter` table. All the data in the column will be lost.
  - Made the column `ssidConected` on table `Adapter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clockSpeed` on table `Memory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Adapter" DROP COLUMN "speed",
ALTER COLUMN "ssidConected" SET NOT NULL;

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "clockSpeed" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;
