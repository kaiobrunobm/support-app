/*
  Warnings:

  - Added the required column `vendor` to the `Disk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adapter" ALTER COLUMN "speed" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Disk" ADD COLUMN     "vendor" TEXT NOT NULL;
