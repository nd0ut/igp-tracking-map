import { useCallback } from "react";
import { RecoilRoot, type MutableSnapshot } from "recoil";
import type { LoaderFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import { authenticator, type UserSession } from "~/util/auth.server";
import { getSession } from "./services/session.server";
import { type Env, envAtom } from "./store/envAtom";
import { userAtom } from "./store/userAtom";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Карта следовых полей",
  viewport: "width=device-width,initial-scale=1",
});

function getEnv() {
  let env: Env = {
    MAPBOX_ACCESS_TOKEN_PUBLIC: process.env.MAPBOX_ACCESS_TOKEN_PUBLIC,
  };
  return env;
}

export let loader: LoaderFunction = async ({ request }) => {
  let authError;
  let user = await authenticator.isAuthenticated(request);
  if (!user) {
    let session = await getSession(request.headers.get("cookie"));
    authError = session.get(authenticator.sessionErrorKey);
  }
  return { user, authError, env: getEnv() };
};

export default function App() {
  const { user, authError, env } = useLoaderData();
  authError && console.log("error", authError);

  const initializeState: (snapshot: MutableSnapshot) => void = useCallback(
    ({ set }) => {
      set<UserSession | null>(userAtom, user);
      set<Env>(envAtom, env);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <html lang="en" data-theme="winter">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <RecoilRoot initializeState={initializeState}>
          <Outlet />
        </RecoilRoot>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
