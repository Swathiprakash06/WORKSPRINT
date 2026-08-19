-- AlterTable: add monthly salary to employees
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "monthlySalary" DOUBLE PRECISION;

-- AlterTable: flag test attendance records
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;

-- Replace attendance unique constraint to allow separate test records
DROP INDEX IF EXISTS "Attendance_employeeId_date_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_employeeId_date_isTest_key" ON "Attendance"("employeeId", "date", "isTest");

-- CreateTable: daily salary credit ledger
CREATE TABLE IF NOT EXISTS "DailySalaryCredit" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "amountCredited" DOUBLE PRECISION NOT NULL,
    "monthlySalaryUsed" DOUBLE PRECISION NOT NULL,
    "workingDaysUsed" INTEGER NOT NULL,
    "perDayRateUsed" DOUBLE PRECISION NOT NULL,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "creditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySalaryCredit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailySalaryCredit_employeeId_date_isTest_key" ON "DailySalaryCredit"("employeeId", "date", "isTest");

ALTER TABLE "DailySalaryCredit" DROP CONSTRAINT IF EXISTS "DailySalaryCredit_employeeId_fkey";
ALTER TABLE "DailySalaryCredit" ADD CONSTRAINT "DailySalaryCredit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: employee notifications
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_employeeId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
