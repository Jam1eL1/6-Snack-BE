/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `orderName` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentKey` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `requestedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `suppliedAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `vat` on the `Payment` table. All the data in the column will be lost.
  - The `method` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[orderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorizedPayerId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DUMMY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentAssigneeId" TEXT,
ADD COLUMN     "paymentClaimExpireAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "approvedAt",
DROP COLUMN "orderName",
DROP COLUMN "paymentKey",
DROP COLUMN "requestedAt",
DROP COLUMN "suppliedAmount",
DROP COLUMN "totalAmount",
DROP COLUMN "vat",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "authorizedPayerId" TEXT NOT NULL,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'DUMMY';

-- CreateIndex
CREATE INDEX "Order_paymentAssigneeId_idx" ON "Order"("paymentAssigneeId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_authorizedPayerId_idx" ON "Payment"("authorizedPayerId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentAssigneeId_fkey" FOREIGN KEY ("paymentAssigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_authorizedPayerId_fkey" FOREIGN KEY ("authorizedPayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
