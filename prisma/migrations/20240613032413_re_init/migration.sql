/*
  Warnings:

  - You are about to drop the `Ammo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FavoriteAmmo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SellFor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ammo" DROP CONSTRAINT "Ammo_itemId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteAmmo" DROP CONSTRAINT "FavoriteAmmo_ammoId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteAmmo" DROP CONSTRAINT "FavoriteAmmo_userId_fkey";

-- DropForeignKey
ALTER TABLE "SellFor" DROP CONSTRAINT "SellFor_itemId_fkey";

-- DropForeignKey
ALTER TABLE "SellFor" DROP CONSTRAINT "SellFor_vendorId_fkey";

-- DropTable
DROP TABLE "Ammo";

-- DropTable
DROP TABLE "FavoriteAmmo";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "SellFor";

-- DropTable
DROP TABLE "Vendor";

-- DropEnum
DROP TYPE "AmmoType";

-- CreateTable
CREATE TABLE "FavoriteBullet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bulletName" TEXT NOT NULL,
    "bulletType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBullet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBullet_userId_bulletName_key" ON "FavoriteBullet"("userId", "bulletName");

-- AddForeignKey
ALTER TABLE "FavoriteBullet" ADD CONSTRAINT "FavoriteBullet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth0Id") ON DELETE RESTRICT ON UPDATE CASCADE;
