/*
  Warnings:

  - You are about to drop the column `time` on the `Parttime` table. All the data in the column will be lost.
  - Added the required column `contact` to the `Parttime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `worktime` to the `Parttime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Parttime" DROP COLUMN "time",
ADD COLUMN     "contact" TEXT NOT NULL,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "worktime" TEXT NOT NULL;
