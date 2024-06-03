/*
  Warnings:

  - You are about to drop the column `path` on the `routes` table. All the data in the column will be lost.
  - Added the required column `route` to the `routes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "routes" DROP COLUMN "path",
ADD COLUMN     "route" TEXT NOT NULL;
