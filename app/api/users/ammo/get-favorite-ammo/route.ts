import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { ratelimit } from "@/ratelimit";

export async function GET() {
  // 1. Authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  // 2. Rate limit
  const { success } = await ratelimit.limit(`fav-read:${auth0Id}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 3. Query DB
  const favorites = await prisma.favoriteItems.findMany({
    where: { userAuth0Id: auth0Id },
    select: { itemId: true },
  });

  // 4. Short private cache to reduce DB pressure
  return NextResponse.json(favorites, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=30",
    },
  });
}
