/*
  Warnings:

  - You are about to drop the `route_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site_statuses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "route_statuses" DROP CONSTRAINT "route_statuses_routeId_fkey";

-- DropForeignKey
ALTER TABLE "site_statuses" DROP CONSTRAINT "site_statuses_siteId_fkey";

-- DropTable
DROP TABLE "route_statuses";

-- DropTable
DROP TABLE "site_statuses";

-- CreateTable
CREATE TABLE "site_checks" (
    "uuid" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_checks_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "route_checks" (
    "uuid" UUID NOT NULL,
    "routeId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "response" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_checks_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_checks_siteId_key" ON "site_checks"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "route_checks_routeId_key" ON "route_checks"("routeId");

-- AddForeignKey
ALTER TABLE "site_checks" ADD CONSTRAINT "site_checks_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "websites"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_checks" ADD CONSTRAINT "route_checks_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
