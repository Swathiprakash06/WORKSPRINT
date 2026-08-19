ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "linkPath" TEXT;

CREATE TABLE IF NOT EXISTS "HrAdminNotification" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT,
    "linkPath" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrAdminNotification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HrAdminNotification" DROP CONSTRAINT IF EXISTS "HrAdminNotification_organizationId_fkey";
ALTER TABLE "HrAdminNotification" ADD CONSTRAINT "HrAdminNotification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
