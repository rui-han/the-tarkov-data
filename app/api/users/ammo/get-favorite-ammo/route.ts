import prisma from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { auth0Id: string } },
) {
  const searchParams = req.nextUrl.searchParams;
  const auth0Id = searchParams.get("auth0Id");

  const exsistingFavoriteAmmo = await prisma.favoriteItems.findMany({
    where: {
      userAuth0Id: auth0Id || "",
    },
    select: {
      itemId: true,
    },
  });

  return NextResponse.json(exsistingFavoriteAmmo);
}
