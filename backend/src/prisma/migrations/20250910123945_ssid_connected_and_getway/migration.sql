/*
  Warnings:

  - Added the required column `networkGetway` to the `Adapter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adapter" ADD COLUMN     "networkGetway" TEXT NOT NULL;
