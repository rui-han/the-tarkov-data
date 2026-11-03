import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function GET() {
  // 1. Authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  // 2. Query DB
  const favorites = await prisma.favoriteItems.findMany({
    where: { userAuth0Id: auth0Id },
    select: { itemId: true },
  });

  // 3. Per-user data that the client refetches right after every
  // add/remove, so it must never be served from a browser/CDN cache.
  return NextResponse.json(favorites, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
