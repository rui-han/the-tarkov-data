import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import { ratelimit } from "@/ratelimit";

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: NextRequest) {
  // 1. Rate limit by IP (feedback doesn't require login, so we can't key by user)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { success } = await ratelimit.limit(`feedback:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // 2. Validate input
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (message.length === 0) {
    return NextResponse.json(
      { error: "Feedback message is required" },
      { status: 400 },
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Feedback must be under ${MAX_MESSAGE_LENGTH} characters` },
      { status: 400 },
    );
  }

  // 3. Attach the logged-in user if there is one, but don't require it
  const session = await getSession();
  const userAuth0Id = session?.user?.sub as string | undefined;

  // 4. Persist
  const feedback = await prisma.feedback.create({
    data: {
      message,
      userAuth0Id: userAuth0Id ?? undefined,
    },
  });

  return NextResponse.json({ success: true, id: feedback.id }, { status: 201 });
}
