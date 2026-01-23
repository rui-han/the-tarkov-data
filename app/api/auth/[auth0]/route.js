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

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { auth0Id: user.sub },
  });

  if (!existingUser) {
    // Create user only once
    await prisma.user.create({
      data: {
        auth0Id: user.sub,
        name: user.name,
        email: user.email,
        image: user.picture,
        createdAt: new Date(),
        favoriteItems: {},
      },
    });
  }

  return session;
};

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
});
