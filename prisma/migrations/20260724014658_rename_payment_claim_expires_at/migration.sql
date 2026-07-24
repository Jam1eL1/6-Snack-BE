/*
  Warnings:

  - You are about to drop the column `paymentClaimExpireAt` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentClaimExpireAt",
ADD COLUMN     "paymentClaimExpiresAt" TIMESTAMP(3);
