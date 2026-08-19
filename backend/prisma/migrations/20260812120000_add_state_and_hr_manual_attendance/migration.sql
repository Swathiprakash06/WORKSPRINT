-- Employee state field
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "state" TEXT;

-- HR manual attendance marking
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "markedByHr" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "hrNote" TEXT;
