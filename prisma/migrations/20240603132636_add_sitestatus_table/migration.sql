-- CreateTable
CREATE TABLE "site_statuses" (
    "uuid" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_statuses_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_statuses_siteId_key" ON "site_statuses"("siteId");

-- AddForeignKey
ALTER TABLE "site_statuses" ADD CONSTRAINT "site_statuses_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "websites"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
