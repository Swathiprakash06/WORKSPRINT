-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "notificationPreferences" JSONB;

-- AlterTable
ALTER TABLE "HrAdmin" ADD COLUMN     "profilePic" TEXT;

-- AlterTable
ALTER TABLE "SuperAdmin" ADD COLUMN     "notificationPreferences" JSONB,
ADD COLUMN     "profilePic" TEXT;
