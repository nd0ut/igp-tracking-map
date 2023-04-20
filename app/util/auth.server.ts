import { User } from "@prisma/client";
import { redirect } from "remix";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import { destroySession, getSession, sessionStorage } from "../services/session.server";
import { db } from "./db.server";

export type UserSession = {
  id: string;
  authId: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  email: string;
};

export const authenticator = new Authenticator<UserSession>(sessionStorage);

export const requireUserSession = async (request: Request) => {
  let userSession = await authenticator.authenticate('auth0', request);
  console.log('userSession', userSession)
  if (!userSession) {
    throw redirect("/login/");
  }
  return userSession;
};

export const requireUser = async (request: Request): Promise<User> => {
  let userSession = await requireUserSession(request)
  const user = await db.user.findUnique({
    where: {
      id: userSession.id,
    },
  });

  if (!user) {
    await authenticator.logout(request, { redirectTo: "/login" });
    throw redirect('/login')
  }

  return user;
};

const getConfig = () => {
  if (
    !process.env.AUTH0_CALLBACK_URL ||
    !process.env.AUTH0_CLIENT_ID ||
    !process.env.AUTH0_CLIENT_SECRET ||
    !process.env.AUTH0_DOMAIN
  ) {
    throw new Error("No Auth0 env variables found");
  }

  return {
    callbackURL: process.env.AUTH0_CALLBACK_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    domain: process.env.AUTH0_DOMAIN,
  };
};

let auth0Strategy = new Auth0Strategy(getConfig(), async ({ profile }) => {
  const data: Pick<UserSession, "authId" | "username" | "email"> = {
    authId: profile.id,
    username: profile.displayName,
    email: profile.emails[0].value,
  };
  const user: UserSession = await db.user.upsert({
    where: { authId: data.authId },
    update: data,
    create: data,
  });

  return user;
});

authenticator.use(auth0Strategy);
