import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";

export async function POST(req: NextRequest) {
  // 1. Authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  // 2. Validate input (a malformed body is a 400, not a 500)
  const body = await req.json().catch(() => null);
  const itemId = typeof body?.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  // 3. Idempotent delete: removing something that is already gone is fine
  // (`delete` would throw P2025 and return a 500)
  await prisma.favoriteItems.deleteMany({
    where: { userAuth0Id: auth0Id, itemId },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
