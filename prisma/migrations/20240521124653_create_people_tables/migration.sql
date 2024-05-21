-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('admin', 'client');

-- CreateEnum
CREATE TYPE "PeopleDocumentType" AS ENUM ('CNPJ', 'CPF');

-- CreateTable
CREATE TABLE "users" (
    "uuid" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "peopleUuid" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "people" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "document" VARCHAR(100),
    "typeDocument" "PeopleDocumentType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "people_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_peopleUuid_key" ON "users"("peopleUuid");

-- CreateIndex
CREATE UNIQUE INDEX "people_email_key" ON "people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "people_document_key" ON "people"("document");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_peopleUuid_fkey" FOREIGN KEY ("peopleUuid") REFERENCES "people"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
