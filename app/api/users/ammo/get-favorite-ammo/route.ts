import prisma from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { auth0Id: string } },
) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const auth0Id = searchParams.get("auth0Id");

    if (!auth0Id) {
      return NextResponse.json(
        { error: "auth0Id is required" },
        { status: 400 },
      );
    }

    const existingFavoriteAmmo = await prisma.favoriteItems.findMany({
      where: {
        userAuth0Id: auth0Id,
      },
      select: {
        itemId: true,
      },
    });

    return NextResponse.json(existingFavoriteAmmo, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorite ammo: ", error);

    return NextResponse.json(
      { error: "Failed to fetch favorite ammo" },
      { status: 500 },
    );
  }
}
