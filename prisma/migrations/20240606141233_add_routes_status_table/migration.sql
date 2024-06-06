-- CreateTable
CREATE TABLE "route_statuses" (
    "uuid" UUID NOT NULL,
    "routeId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "response" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_statuses_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "route_statuses" ADD CONSTRAINT "route_statuses_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
