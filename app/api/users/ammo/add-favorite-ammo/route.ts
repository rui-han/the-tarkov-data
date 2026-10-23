import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { ratelimit } from "@/ratelimit";

// Any item can be favorited now, so bound what a single user can store.
const MAX_FAVORITES = 200;
const ITEM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export async function POST(req: NextRequest) {
  // 1. Authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  // 2. Rate limit per user
  const { success } = await ratelimit.limit(`fav-add:${auth0Id}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 3. Validate input (a malformed body is a 400, not a 500)
  const body = await req.json().catch(() => null);
  const itemId = typeof body?.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || !ITEM_ID_PATTERN.test(itemId)) {
    return NextResponse.json(
      { error: "A valid itemId is required" },
      { status: 400 },
    );
  }

  // 4. Enforce the cap. Re-adding something that is already a favorite is
  // still fine at the limit. (Not atomic: two simultaneous requests can
  // overshoot by a row or two, which doesn't matter for an abuse guard.)
  const count = await prisma.favoriteItems.count({
    where: { userAuth0Id: auth0Id },
  });
  if (count >= MAX_FAVORITES) {
    const existing = await prisma.favoriteItems.findUnique({
      where: { userAuth0Id_itemId: { userAuth0Id: auth0Id, itemId } },
      select: { itemId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: `You can favorite up to ${MAX_FAVORITES} items` },
        { status: 409 },
      );
    }
  }

  // 5. Idempotent write (prevents duplicate rows)
  await prisma.favoriteItems.upsert({
    where: {
      userAuth0Id_itemId: {
        userAuth0Id: auth0Id,
        itemId,
      },
    },
    update: {},
    create: {
      userAuth0Id: auth0Id,
      itemId,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
