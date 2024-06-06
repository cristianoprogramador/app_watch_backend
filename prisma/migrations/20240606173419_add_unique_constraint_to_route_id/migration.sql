/*
  Warnings:

  - A unique constraint covering the columns `[routeId]` on the table `route_statuses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "route_statuses_routeId_key" ON "route_statuses"("routeId");
