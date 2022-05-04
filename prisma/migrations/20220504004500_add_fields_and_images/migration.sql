-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT E'USER';

-- CreateTable
CREATE TABLE "TrackingField" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" INTEGER NOT NULL,

    CONSTRAINT "TrackingField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingFieldImage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "trackingFieldId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "TrackingFieldImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrackingField" ADD CONSTRAINT "TrackingField_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingFieldImage" ADD CONSTRAINT "TrackingFieldImage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingFieldImage" ADD CONSTRAINT "TrackingFieldImage_trackingFieldId_fkey" FOREIGN KEY ("trackingFieldId") REFERENCES "TrackingField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
