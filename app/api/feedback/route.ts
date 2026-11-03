import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";

const MAX_MESSAGE_LENGTH = 2000;

// This endpoint is anonymous and writes to the database. Instead of a per-IP
// limiter (which needs Redis), cap how many submissions the whole site accepts
// per minute. The count uses the Feedback.createdAt index. A flood can briefly
// block honest submissions, but it can't fill the table.
const MAX_FEEDBACK_PER_MINUTE = 20;
const WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  // 1. Validate input
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

  // 2. Site-wide cap
  const recent = await prisma.feedback.count({
    where: { createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
  });
  if (recent >= MAX_FEEDBACK_PER_MINUTE) {
    return NextResponse.json(
      { error: "Too many submissions right now, please try again in a minute" },
      { status: 429, headers: { "Retry-After": "60" } },
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
