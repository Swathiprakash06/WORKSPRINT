CREATE TABLE IF NOT EXISTS "EmployeeQuery" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "hrResponse" TEXT,
    "respondedBy" INTEGER,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeQuery_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "EmployeeQuery" DROP CONSTRAINT IF EXISTS "EmployeeQuery_employeeId_fkey";
ALTER TABLE "EmployeeQuery" ADD CONSTRAINT "EmployeeQuery_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
