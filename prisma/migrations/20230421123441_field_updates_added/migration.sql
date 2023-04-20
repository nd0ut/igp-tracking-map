/*
  Warnings:

  - You are about to drop the column `fieldId` on the `TrackingFieldImage` table. All the data in the column will be lost.
  - Added the required column `updateId` to the `TrackingFieldImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrackingFieldImage" DROP CONSTRAINT "TrackingFieldImage_fieldId_fkey";

-- AlterTable
ALTER TABLE "TrackingFieldImage" DROP COLUMN "fieldId",
ADD COLUMN     "updateId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TrackingFieldUpdate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "actualAt" TIMESTAMP(3) NOT NULL,
    "road" INTEGER NOT NULL,
    "cover" TEXT[],
    "description" TEXT NOT NULL,

    CONSTRAINT "TrackingFieldUpdate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrackingFieldUpdate" ADD CONSTRAINT "TrackingFieldUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingFieldUpdate" ADD CONSTRAINT "TrackingFieldUpdate_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "TrackingField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingFieldImage" ADD CONSTRAINT "TrackingFieldImage_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "TrackingFieldUpdate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
