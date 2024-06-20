/*
  Warnings:

  - You are about to drop the `FavoriteBullet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteBullet" DROP CONSTRAINT "FavoriteBullet_userId_fkey";

-- DropTable
DROP TABLE "FavoriteBullet";

-- CreateTable
CREATE TABLE "FavoriteItems" (
    "itemId" TEXT NOT NULL,
    "userAuth0Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteItems_pkey" PRIMARY KEY ("userAuth0Id","itemId")
);

-- AddForeignKey
ALTER TABLE "FavoriteItems" ADD CONSTRAINT "FavoriteItems_userAuth0Id_fkey" FOREIGN KEY ("userAuth0Id") REFERENCES "User"("auth0Id") ON DELETE RESTRICT ON UPDATE CASCADE;
