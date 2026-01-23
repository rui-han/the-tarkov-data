import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { ratelimit } from "@/ratelimit";

export async function POST(req: NextRequest) {
  // 1. Authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  // 2. Rate limit
  const { success } = await ratelimit.limit(`fav-del:${auth0Id}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 3. Validate input
  const { itemId } = await req.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  // 4. Delete safely
  await prisma.favoriteItems.delete({
    where: {
      userAuth0Id_itemId: {
        userAuth0Id: auth0Id,
        itemId,
      },
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
