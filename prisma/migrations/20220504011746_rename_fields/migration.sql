/*
  Warnings:

  - You are about to drop the column `authorId` on the `TrackingField` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `TrackingFieldImage` table. All the data in the column will be lost.
  - You are about to drop the column `trackingFieldId` on the `TrackingFieldImage` table. All the data in the column will be lost.
  - Added the required column `userId` to the `TrackingField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldId` to the `TrackingFieldImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TrackingFieldImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrackingField" DROP CONSTRAINT "TrackingField_authorId_fkey";

-- DropForeignKey
ALTER TABLE "TrackingFieldImage" DROP CONSTRAINT "TrackingFieldImage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "TrackingFieldImage" DROP CONSTRAINT "TrackingFieldImage_trackingFieldId_fkey";

-- AlterTable
ALTER TABLE "TrackingField" RENAME COLUMN "authorId" TO "userId";

-- AlterTable
ALTER TABLE "TrackingFieldImage" RENAME COLUMN "authorId" TO "userId";
ALTER TABLE "TrackingFieldImage" RENAME COLUMN "trackingFieldId" TO "fieldId";

-- AddForeignKey
ALTER TABLE "TrackingField" ADD CONSTRAINT "TrackingField_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingFieldImage" ADD CONSTRAINT "TrackingFieldImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingFieldImage" ADD CONSTRAINT "TrackingFieldImage_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "TrackingField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
