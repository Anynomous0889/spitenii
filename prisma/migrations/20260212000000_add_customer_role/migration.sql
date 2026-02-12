-- AlterTable: Make password optional
ALTER TABLE "User" ALTER COLUMN password DROP NOT NULL;

-- AlterEnum: Add CUSTOMER role
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- UpdateTable: Set all users as verified by default
UPDATE "User" SET "isEmailVerified" = true WHERE "isEmailVerified" = false;
