import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import prisma from "@/prisma/db";
import { ratelimit } from "@/ratelimit";

const afterCallback = async (req, session) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Rate limit Auth callback to prevent abuse
  const { success } = await ratelimit.limit(`auth-callback:${ip}`);
  if (!success) {
    throw new Error("Too many login attempts");
  }

  const { user } = session;

  // name / email / image are required columns, but some social logins don't
  // return them. Fall back to placeholders so the login doesn't fail.
  const email = user.email ?? `${user.sub}@users.noreply.invalid`;
  const name = user.name ?? user.nickname ?? email;
  const image = user.picture ?? "";

  // upsert is atomic, unlike findUnique + create, which races when two
  // callbacks for a new user run at the same time. An existing user is left
  // untouched.
  await prisma.user.upsert({
    where: { auth0Id: user.sub },
    update: {},
    create: { auth0Id: user.sub, name, email, image },
  });

  return session;
};

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
});
