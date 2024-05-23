/*
  Warnings:

  - You are about to drop the column `peopleUuid` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `people` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userDetailsUuid]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_peopleUuid_fkey";

-- DropIndex
DROP INDEX "users_peopleUuid_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "peopleUuid",
ADD COLUMN     "userDetailsUuid" UUID;

-- DropTable
DROP TABLE "people";

-- CreateTable
CREATE TABLE "user_details" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "document" VARCHAR(100),
    "typeDocument" "PeopleDocumentType",
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_details_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_details_email_key" ON "user_details"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_details_document_key" ON "user_details"("document");

-- CreateIndex
CREATE UNIQUE INDEX "users_userDetailsUuid_key" ON "users"("userDetailsUuid");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userDetailsUuid_fkey" FOREIGN KEY ("userDetailsUuid") REFERENCES "user_details"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
