import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import { sessionStorage } from "../services/session.server";
import { db } from "./db.server";

export type User = {
  id: string;
  authId: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  email: string;
};

export const authenticator = new Authenticator<User>(sessionStorage);

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
  const data: Pick<User, "authId" | "username" | "email"> = {
    authId: profile.id,
    username: profile.displayName,
    email: profile.emails[0].value,
  };
  const user: User = await db.user.upsert({
    where: { authId: data.authId },
    update: data,
    create: data,
  });

  return user;
});

authenticator.use(auth0Strategy);
