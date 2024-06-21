import prisma from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { auth0Id, itemId } = await req.json();

  try {
    const deleteFavorite = await prisma.favoriteItems.delete({
      where: {
        userAuth0Id_itemId: {
          userAuth0Id: auth0Id,
          itemId: itemId,
        },
      },
    });

    return NextResponse.json(
      { message: "Favorite ammo removed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing favorite ammo: ", error);

    return NextResponse.json(
      { error: "Failed to remove favorite ammo" },
      { status: 500 },
    );
  }
}
