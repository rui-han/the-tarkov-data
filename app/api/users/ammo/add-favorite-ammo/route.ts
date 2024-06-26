import prisma from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { auth0Id: string; itemId: string };
}

export async function POST(req: NextRequest) {
  try {
    const { auth0Id, itemId } = await req.json();

    const createUserFavorite = await prisma.favoriteItems.create({
      data: {
        itemId: itemId,
        userAuth0Id: auth0Id,
      },
    });

    return NextResponse.json(createUserFavorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite ammo: ", error);

    return NextResponse.json(
      { error: "Failed to add favorite ammo" },
      { status: 500 },
    );
  }
}
