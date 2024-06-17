import { handleAuth, handleCallback, Session } from "@auth0/nextjs-auth0";
import prisma from "@/prisma/db";
import { NextApiRequest, NextApiResponse } from "next";

const afterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  state: any,
): Promise<Session> => {
  const { user } = session;

  const existingUser = await prisma.user.findUnique({
    where: { auth0Id: user.sub },
  });

  // check if user already exists
  if (existingUser) {
    console.log(`User ${user.name} already exists in db!`);
  } else {
    // if not, create a new user in db
    try {
      await prisma.user.create({
        data: {
          auth0Id: user.sub,
          name: user.name,
          email: user.email,
          image: user.picture,
          createdAt: new Date(),
          favoriteBullets: {},
        },
      });
      console.log(`Created new user: ${user.name}`);
    } catch (error) {
      console.error(`Error creating user: ${error}`);
    }
  }

  return session;
};

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
});
