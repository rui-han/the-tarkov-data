-- CreateEnum
CREATE TYPE "AmmoType" AS ENUM ('BULLET', 'BUCKSHOT', 'GRENADE', 'FLASHBANG');

-- CreateTable
CREATE TABLE "User" (
    "auth0Id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("auth0Id")
);

-- CreateTable
CREATE TABLE "FavoriteAmmo" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "ammoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteAmmo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastLowPrice" DOUBLE PRECISION,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellFor" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "priceRUB" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SellFor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ammo" (
    "id" SERIAL NOT NULL,
    "caliber" TEXT NOT NULL,
    "ammoType" "AmmoType" NOT NULL,
    "projectileCount" INTEGER,
    "itemId" INTEGER NOT NULL,
    "damage" DOUBLE PRECISION NOT NULL,
    "penetrationPower" DOUBLE PRECISION NOT NULL,
    "armorDamage" DOUBLE PRECISION NOT NULL,
    "accuracyModifier" DOUBLE PRECISION NOT NULL,
    "recoilModifier" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ammo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteAmmo_userId_key" ON "FavoriteAmmo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ammo_itemId_key" ON "Ammo"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Ammo_caliber_ammoType_itemId_key" ON "Ammo"("caliber", "ammoType", "itemId");

-- AddForeignKey
ALTER TABLE "FavoriteAmmo" ADD CONSTRAINT "FavoriteAmmo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth0Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteAmmo" ADD CONSTRAINT "FavoriteAmmo_ammoId_fkey" FOREIGN KEY ("ammoId") REFERENCES "Ammo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellFor" ADD CONSTRAINT "SellFor_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellFor" ADD CONSTRAINT "SellFor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ammo" ADD CONSTRAINT "Ammo_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
