/*
  Warnings:

  - You are about to drop the `EmailLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "EmailLog";

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);
