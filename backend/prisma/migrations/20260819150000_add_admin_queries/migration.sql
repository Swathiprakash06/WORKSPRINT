CREATE TABLE "AdminQuery" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "hrAdminId" INTEGER NOT NULL,
    "senderRole" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "response" TEXT,
    "respondedByRole" TEXT,
    "respondedById" INTEGER,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminQuery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminQuery_organizationId_createdAt_idx" ON "AdminQuery"("organizationId", "createdAt");
CREATE INDEX "AdminQuery_hrAdminId_createdAt_idx" ON "AdminQuery"("hrAdminId", "createdAt");
ALTER TABLE "AdminQuery" ADD CONSTRAINT "AdminQuery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminQuery" ADD CONSTRAINT "AdminQuery_hrAdminId_fkey" FOREIGN KEY ("hrAdminId") REFERENCES "HrAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;